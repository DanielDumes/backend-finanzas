const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tipo: {
      type: String,
      enum: ['ingreso', 'egreso'],
      required: [true, 'El tipo es obligatorio'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [100, 'La descripción no puede superar 100 caracteres'],
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    mes: {
      type: Number, // 1-12
      required: true,
    },
    anio: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Index para consultas frecuentes
transactionSchema.index({ usuario: 1, anio: 1, mes: 1 });
transactionSchema.index({ usuario: 1, tipo: 1 });

// Calcular mes y año automáticamente desde la fecha
transactionSchema.pre('save', function (next) {
  if (this.fecha) {
    const d = new Date(this.fecha);
    this.mes  = d.getUTCMonth() + 1;
    this.anio = d.getUTCFullYear();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
