import Transaction from '../models/Transaction.js';
import SavingsGoal from '../models/SavingsGoal.js';
import mongoose from 'mongoose';

const toNumber = d => parseFloat(d.toString());

/* ----------  RESUMEN MENSUAL  ---------- */
export const getMonthlySummary = async (req, res) => {
  try {
    const { month } = req.query; // 2025-09
    if (!month) return res.status(400).json({ message: 'Falta month' });

    const [year, mm] = month.split('-').map(Number);
    const start = new Date(year, mm - 1, 1);
    const end   = new Date(year, mm, 1);
    const userId = req.user._id;

    /* 1.  Ingresos / Gastos del mes */
    const incomeAgg = await Transaction.aggregate([
      { $match: { user_id: userId, type: 'ingreso', date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const expenseAgg = await Transaction.aggregate([
      { $match: { user_id: userId, type: 'gasto', date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyIncome  = incomeAgg.length  ? toNumber(incomeAgg[0].total)  : 0;
    const monthlyExpense = expenseAgg.length ? toNumber(expenseAgg[0].total) : 0;
    const monthlySavings = monthlyIncome - monthlyExpense;

    /* 2.  Saldo total (acumulado) */
    const totalIncome  = await Transaction.aggregate([
      { $match: { user_id: userId, type: 'ingreso' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpense = await Transaction.aggregate([
      { $match: { user_id: userId, type: 'gasto' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBalance = (totalIncome.length  ? toNumber(totalIncome[0].total)  : 0) -
                         (totalExpense.length ? toNumber(totalExpense[0].total) : 0);

    /* 3.  Gastos por categoría (mes) */
    const byCategory = await Transaction.aggregate([
      { $match: { user_id: userId, type: 'gasto', date: { $gte: start, $lt: end } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'cat'
        }
      },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { id: '$category_id', name: { $ifNull: ['$cat.name', 'Sin categoría'] } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, category: '$_id.name', total: { $toDouble: '$total' }, count: 1 } },
      { $sort: { total: -1 } }
    ]);

    /* 4.  Actividad reciente (últimas 10 transacciones) */
    const recent = await Transaction.find({ user_id: userId })
      .populate('category_id', 'name')
      .sort({ created_at: -1 })
      .limit(10)
      .lean();

    /* 5.  Ahorro total en metas (opcional) */
    const savedInGoals = await SavingsGoal.aggregate([
      { $match: { user_id: userId, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$current_amount' } } }
    ]);
    const totalSaved = savedInGoals.length ? toNumber(savedInGoals[0].total) : 0;

    return res.json({
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      monthlySavings,
      totalSaved,
      expensesByCategory: byCategory,
      recentTransactions: recent
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error al generar resumen' });
  }
};