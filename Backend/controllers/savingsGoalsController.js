import SavingsGoal from '../models/savingsGoalsModel.js';
import mongoose from 'mongoose';

const toNumber = d => parseFloat(d.toString());

/* ---------- HELPERS ---------- */
function getMonthlyQuota(target, current, dueDate) {
    const now = new Date();
    const diffMonths = Math.max(0, (dueDate.getFullYear() - now.getFullYear()) * 12 + (dueDate.getMonth() - now.getMonth()));
    const remaining = target - current;
    return diffMonths === 0 ? remaining : remaining / (diffMonths + 1);
}

/* ---------- 1. CREAR META ---------- */
export const createSavingsGoal = async (req, res) => {
    try {
        const { name, description, target_amount, due_date } = req.body;

        const exists = await SavingsGoal.findOne({
            user_id: req.user._id,
            name: name.trim(),
            isDeleted: false
        });
        if (exists) return res.status(409).json({ message: 'Ya tienes una meta con ese nombre.' });

        const goal = await SavingsGoal.create({
            user_id: req.user._id,
            name: name.trim(),
            description: description || '',
            target_amount,
            due_date: new Date(due_date),
            current_amount: 0
        });

        return res.status(201).json({ goal });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al crear meta de ahorro' });
    }
};

/* ---------- 2. LISTAR METAS DEL USUARIO ---------- */
export const getUserGoals = async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ user_id: req.user._id, isDeleted: false }).lean();

        const enriched = goals.map(g => {
            const target = toNumber(g.target_amount);
            const current = toNumber(g.current_amount);
            const progress = target ? Math.min(100, (current / target) * 100) : 0;
            const status = new Date() > new Date(g.due_date) ? 'vencida' : 'activa';
            const monthlyQuota = getMonthlyQuota(target, current, new Date(g.due_date));

            return {
                _id: g._id,
                name: g.name,
                description: g.description,
                target_amount: target,
                current_amount: current,
                due_date: g.due_date,
                status,
                progress: parseFloat(progress.toFixed(2)),
                monthly_quota: parseFloat(monthlyQuota.toFixed(2))
            };
        });

        return res.json({ goals: enriched });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al obtener metas' });
    }
};

/* ---------- 3. EDITAR META ---------- */
export const updateSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await SavingsGoal.findOneAndUpdate(
            { _id: id, user_id: req.user._id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!goal) return res.status(404).json({ message: 'Meta no encontrada' });
        return res.json({ goal });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al actualizar meta' });
    }
};

/* ---------- 4. ELIMINAR META (soft) ---------- */
export const deleteSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const goal = await SavingsGoal.findOneAndUpdate(
            { _id: id, user_id: req.user._id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!goal) return res.status(404).json({ message: 'Meta no encontrada' });
        return res.json({ message: 'Meta eliminada' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al eliminar meta' });
    }
};

/* ---------- 5. AGREGAR DINERO A META ---------- */
export const addMoneyToGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const raw = req.body.amount;

        // --- validación de tipo y rango ---
        const amount = Number(raw);
        if (!Number.isFinite(amount) || amount <= 0)
        return res.status(400).json({ message: 'Monto inválido' });

        // --- saldo disponible del usuario ---
        const [totalIncome, totalExpense] = await Promise.all([
        Transaction.aggregate([
            { $match: { user_id: req.user._id, type: 'ingreso' } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ]),
        Transaction.aggregate([
            { $match: { user_id: req.user._id, type: 'gasto' } },
            { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
        ])
        ]);

        const totalBalance =
        (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0);

        if (amount > totalBalance)
        return res.status(400).json({ message: 'Saldo insuficiente' });

        // --- buscamos la meta ---
        const goal = await SavingsGoal.findOne({
        _id: id,
        user_id: req.user._id,
        isDeleted: false
        });
        if (!goal)
        return res.status(404).json({ message: 'Meta no encontrada' });

        const current = parseFloat(goal.current_amount.toString());
        const target  = parseFloat(goal.target_amount.toString());

        // --- ajustamos solo hasta el tope de la meta ---
        const newCurrent = Math.min(current + amount, target);
        goal.current_amount = newCurrent;
        await goal.save();

        // (opcional) aquí podrías crear una transacción de tipo "gasto"
        // para reflejar que ese dinero ya no está disponible:
        await Transaction.create({
        user_id: req.user._id,
        type: 'gasto',
        amount,
        category_id: null,          // o una categoría especial "Ahorro"
        description: `Abono a meta: ${goal.name}`,
        date: new Date()
        });

        return res.json({
        message: 'Dinero agregado',
        goal: {
            _id: goal._id,
            name: goal.name,
            current_amount: newCurrent,
            target_amount: target,
            completed: newCurrent >= target
        }
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'Error al abonar a la meta' });
    }
    };