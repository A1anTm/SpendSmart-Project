import Budget from '../models/budgetsModel.js';
import Transaction from '../models/transactionsModel.js';
import mongoose from 'mongoose';

const toNumber = d => parseFloat(d.toString());

/* ---------- HELPERS ---------- */
async function spentInPeriod(userId, catId, month) {
const [year, mm] = month.split('-').map(Number);
const start = new Date(year, mm - 1, 1);
const end   = new Date(year, mm, 1);

const agg = await Transaction.aggregate([
    { $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        category_id: new mongoose.Types.ObjectId(catId),
        type: 'gasto',
        date: { $gte: start, $lt: end }
    }},
    { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
]);

return agg.length ? agg[0].total : 0;
}

/* ---------- 1. CREAR PRESUPUESTO ---------- */
export const createBudget = async (req, res) => {
    try {
        const { category_id, month, limit, threshold } = req.body;
        // Verificar límite de 5 presupuestos activos
        const activeCount = await Budget.countDocuments({
            user_id: req.user._id,
            isActive: true
        });
        if (activeCount >= 5) {
            return res.status(409).json({
                message: 'Solo puedes tener hasta 5 presupuestos activos simultáneamente.'
            });
        }
        // Verificar duplicado
        const exists = await Budget.findOne({
            user_id: req.user._id,
            category_id,
            month,
            isActive: true
        });
        if (exists) {
            return res.status(409).json({
                message: 'Ya existe un presupuesto activo para esa categoría y mes.'
            });
        }
        const bud = await Budget.create({
            user_id: req.user._id,
            category_id,
            month,
            limit,
            threshold
        });
        return res.status(201).json({ budget: bud });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al crear presupuesto' });
    }
};

/* ---------- 2. ACTUALIZAR PRESUPUESTO ---------- */
export const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const upd = await Budget.findOneAndUpdate(
            { _id: id, user_id: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!upd) return res.status(404).json({ message: 'Presupuesto no encontrado' });
        return res.json({ budget: upd });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al actualizar' });
    }
};

/* ---------- 3. LISTAR CON RESUMEN ---------- */
export const listBudgets = async (req, res) => {
try {
    const { month } = req.query; // ?month=2025-09
    const match = { user_id: req.user._id, isActive: true };
    if (month) match.month = month;

    const budgets = await Budget.find(match)
    .populate('category_id', 'name')
    .lean();

    const enriched = await Promise.all(
    budgets.map(async b => {
        const spent = await spentInPeriod(req.user._id, b.category_id._id, b.month);
        const limitNum = toNumber(b.limit);
        const avail = limitNum - spent;
        const percent = limitNum ? ((spent / limitNum) * 100).toFixed(1) : 0;

        return {
        _id: b._id,
        category: b.category_id.name,
        month: b.month,
        limit: limitNum,
        threshold: b.threshold,
        isActive: b.isActive,
        spent,
        available: avail,
        percentUsed: parseFloat(percent),
        alert: b.isActive && b.threshold <= percent
        };
    })
    );

    return res.json({ budgets: enriched });
} catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error al listar presupuestos' });
}
};

/* ---------- 4. ACTIVAR / DESACTIVAR ---------- */
export const toggleBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const bud = await Budget.findOne({ _id: id, user_id: req.user._id });
        if (!bud) return res.status(404).json({ message: 'Presupuesto no encontrado' });
        bud.isActive = !bud.isActive;
        await bud.save();
        return res.json({ budget: bud, message: bud.isActive ? 'Presupuesto activado' : 'Presupuesto desactivado' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al cambiar estado' });
    }
};

/* ---------- 5. ELIMINAR (hard) ---------- */
export const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        const del = await Budget.findOneAndDelete({ _id: id, user_id: req.user._id });
        if (!del) return res.status(404).json({ message: 'Presupuesto no encontrado' });
        return res.json({ message: 'Presupuesto eliminado' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al eliminar' });
    }
};

/* ---------- 6. CONFIGURAR ALERTAS ---------- */
export const updateAlertSettings = async (req, res) => {
    try {
        const { emailAlerts, weeklyReports, monthlyReports, thresholdEnabled } = req.body;
        const user = req.user;
        user.alertSettings = {
            emailAlerts: emailAlerts ?? user.alertSettings.emailAlerts,
            weeklyReports: weeklyReports ?? user.alertSettings.weeklyReports,
            monthlyReports: monthlyReports ?? user.alertSettings.monthlyReports
        };
        if (typeof thresholdEnabled === 'boolean') user.thresholdEnabled = thresholdEnabled;
        await user.save();
        return res.json({ alertSettings: user.alertSettings, thresholdEnabled: user.thresholdEnabled });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al guardar configuración' });
    }
};
