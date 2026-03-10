// backend/controllers/goalController.js
const Goal = require('../models/Goal');

// GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ usuario: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { nombre, descripcion, montoObjetivo, fechaLimite, icono } = req.body;
    const goal = await Goal.create({
      usuario: req.user._id,
      nombre,
      descripcion,
      montoObjetivo,
      fechaLimite: fechaLimite ? new Date(fechaLimite) : undefined,
      icono: icono || '🎯',
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/goals/:id/abonar
const abonarGoal = async (req, res) => {
  try {
    const { monto } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!goal) return res.status(404).json({ success: false, message: 'Meta no encontrada.' });

    goal.montoActual = Math.min(goal.montoActual + parseFloat(monto), goal.montoObjetivo);
    if (goal.montoActual >= goal.montoObjetivo) goal.completada = true;

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Meta no encontrada.' });

    await goal.deleteOne();
    res.status(200).json({ success: true, message: 'Meta eliminada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Meta no encontrada.' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getGoals, createGoal, abonarGoal, deleteGoal, updateGoal };