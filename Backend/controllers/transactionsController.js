import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

/* ---------- HELPERS ---------- */
const toNumber = (decimal128) => parseFloat(decimal128.toString());

/* ---------- 1. CREAR TRANSACCIÓN ---------- */
export const createTransaction = async (req, res) => {
try {
    const { type, amount, date, category_id, description } = req.body;
    if (!["ingreso", "gasto"].includes(type))
    return res.status(400).json({ message: "Tipo debe ser ingreso o gasto" });

    const newTx = await Transaction.create({
    user_id: req.user._id,
    type,
    amount,
    date,
    category_id: category_id || null,
    description: description || null,
    });
    return res.status(201).json({ transaction: newTx });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al crear transacción" });
}
};

/* ---------- 2. ACTUALIZAR TRANSACCIÓN ---------- */
export const updateTransaction = async (req, res) => {
try {
    const { id } = req.params;
    const updates = req.body;

    const tx = await Transaction.findOneAndUpdate(
    { _id: id, user_id: req.user._id },
    updates,
    { new: true, runValidators: true }
    );
    if (!tx)
    return res.status(404).json({ message: "Transacción no encontrada" });

    return res.json({ transaction: tx });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al actualizar transacción" });
}
};

/* ---------- 3. LISTAR TRANSACCIONES DEL USUARIO ---------- */
export const getUserTransactions = async (req, res) => {
try {
    const {
    page = 1,
    limit = 20,
    type,
    category_id,
    startDate,
    endDate,
    } = req.query;
    const filters = { user_id: req.user._id };
    if (type) filters.type = type;
    if (category_id) filters.category_id = category_id;
    if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
    }

    const txs = await Transaction.find(filters)
    .populate("category_id", "name")
    .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filters);
    return res.json({ total, page, transactions: txs });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al obtener transacciones" });
}
};

/* ---------- 4. ELIMINAR TRANSACCIÓN ---------- */
export const deleteTransaction = async (req, res) => {
try {
    const { id } = req.params;
    const tx = await Transaction.findOneAndDelete({
    _id: id,
    user_id: req.user._id,
    });
    if (!tx)
    return res.status(404).json({ message: "Transacción no encontrada" });
    return res.json({ message: "Transacción eliminada" });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al eliminar transacción" });
}
};

/* ---------- 5. RESUMEN POR CATEGORÍA Y MES ---------- */
export const getSummaryByCategory = async (req, res) => {
try {
    const { year, month } = req.query; // ?year=2025&month=9
    if (!year || !month)
    return res.status(400).json({ message: "Faltan year y/o month" });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const pipeline = [
    {
        $match: {
        user_id: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: start, $lt: end },
        },
    },
    {
        $group: {
        _id: { category: "$category_id", type: "$type" },
        total: { $sum: "$amount" },
        },
    },
    {
        $lookup: {
        from: "categories",
        localField: "_id.category",
        foreignField: "_id",
        as: "cat",
        },
    },
    { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
    {
        $project: {
        category: { $ifNull: ["$cat.name", "Sin categoría"] },
        type: "$_id.type",
        total: { $toDouble: "$total" },
        },
    },
    ];

    const raw = await Transaction.aggregate(pipeline);
    // Formatear salida
    const grouped = {};
    raw.forEach((row) => {
    const key = row.category;
    if (!grouped[key]) grouped[key] = { ingreso: 0, gasto: 0 };
    grouped[key][row.type] = row.total;
    });

    return res.json({ summary: grouped });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error al obtener resumen" });
}
};
