// backend/models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [1, 'El monto debe ser mayor a 0'],
    },
    mes: {
      type: Number,
      required: true,
      min: 1, max: 12,
    },
    anio: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Un presupuesto por categoría por mes/año por usuario
budgetSchema.index({ usuario: 1, categoria: 1, mes: 1, anio: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);