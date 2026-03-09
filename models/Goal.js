// backend/models/Goal.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [60, 'El nombre no puede superar 60 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede superar 200 caracteres'],
    },
    montoObjetivo: {
      type: Number,
      required: [true, 'El monto objetivo es obligatorio'],
      min: [1, 'El monto debe ser mayor a 0'],
    },
    montoActual: {
      type: Number,
      default: 0,
      min: 0,
    },
    fechaLimite: {
      type: Date,
    },
    completada: {
      type: Boolean,
      default: false,
    },
    icono: {
      type: String,
      default: '🎯',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);