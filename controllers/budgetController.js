// backend/controllers/budgetController.js
const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');

// GET /api/budgets?mes=1&anio=2024
const getBudgets = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const budgets = await Budget.find({
      usuario: req.user._id,
      mes:  parseInt(mes),
      anio: parseInt(anio),
    });

    // Para cada presupuesto calcular cuánto se ha gastado
    const budgetsConGasto = await Promise.all(
      budgets.map(async (b) => {
        const txs = await Transaction.find({
          usuario:   req.user._id,
          tipo:      'egreso',
          categoria: b.categoria,
          mes:       b.mes,
          anio:      b.anio,
        });
        const gastado = txs.reduce((s, t) => s + t.monto, 0);
        return {
          ...b.toObject(),
          gastado,
          disponible: Math.max(b.monto - gastado, 0),
          porcentaje: Math.min(Math.round((gastado / b.monto) * 100), 100),
          excedido:   gastado > b.monto,
        };
      })
    );

    res.status(200).json({ success: true, data: budgetsConGasto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/budgets
const createBudget = async (req, res) => {
  try {
    const { categoria, monto, mes, anio } = req.body;

    // Si ya existe, actualizar
    const existing = await Budget.findOne({
      usuario: req.user._id,
      categoria,
      mes:  parseInt(mes),
      anio: parseInt(anio),
    });

    if (existing) {
      existing.monto = monto;
      await existing.save();
      return res.status(200).json({ success: true, data: existing });
    }

    const budget = await Budget.create({
      usuario: req.user._id,
      categoria,
      monto,
      mes:  parseInt(mes),
      anio: parseInt(anio),
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Presupuesto no encontrado.' });
    await budget.deleteOne();
    res.status(200).json({ success: true, message: 'Presupuesto eliminado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBudgets, createBudget, deleteBudget };