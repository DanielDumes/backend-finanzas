const Transaction = require('../models/Transaction');

// GET /api/transactions?mes=1&anio=2024
const getTransactions = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const filter = { usuario: req.user._id };

    if (mes) filter.mes = parseInt(mes);
    if (anio) filter.anio = parseInt(anio);

    const transactions = await Transaction.find(filter).sort({ fecha: -1 });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { tipo, descripcion, monto, categoria, fecha } = req.body;
    const d = new Date(fecha);

    const transaction = await Transaction.create({
      usuario: req.user._id,
      tipo,
      descripcion,
      monto,
      categoria,
      fecha: d,
      mes:   d.getUTCMonth() + 1,
      anio:  d.getUTCFullYear(),
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      usuario: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada.' });
    }

    await transaction.deleteOne();
    res.status(200).json({ success: true, message: 'Transacción eliminada.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/transactions/resumen?anio=2024
const getResumen = async (req, res) => {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();

    const resumen = await Transaction.aggregate([
      { $match: { usuario: req.user._id, anio } },
      {
        $group: {
          _id: { mes: '$mes', tipo: '$tipo' },
          total: { $sum: '$monto' },
        },
      },
      { $sort: { '_id.mes': 1 } },
    ]);

    // Formatear respuesta por mes
    const porMes = {};
    for (let i = 1; i <= 12; i++) {
      porMes[i] = { mes: i, ingresos: 0, egresos: 0 };
    }

    resumen.forEach((r) => {
      const { mes, tipo } = r._id;
      if (tipo === 'ingreso') porMes[mes].ingresos = r.total;
      else porMes[mes].egresos = r.total;
    });

    // Balance acumulado
    const balanceAcumulado = await Transaction.aggregate([
      { $match: { usuario: req.user._id } },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$monto' },
        },
      },
    ]);

    let totalIngresos = 0, totalEgresos = 0;
    balanceAcumulado.forEach((b) => {
      if (b._id === 'ingreso') totalIngresos = b.total;
      else totalEgresos = b.total;
    });

    res.status(200).json({
      success: true,
      data: {
        porMes: Object.values(porMes),
        balanceAcumulado: totalIngresos - totalEgresos,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const { tipo, descripcion, monto, categoria, fecha } = req.body;
    const d = new Date(fecha);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user._id },
      {
        tipo, descripcion, monto,
        categoria, fecha: d,
        mes:  d.getUTCMonth() + 1,
        anio: d.getUTCFullYear(),
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada.' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getTransactions, createTransaction, deleteTransaction, getResumen, updateTransaction };
