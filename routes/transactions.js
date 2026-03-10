const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getResumen,
  updateTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middlewares/auth');

router.use(protect); // todas las rutas requieren autenticación

router.get('/resumen', getResumen);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);
router.put('/:id', updateTransaction)

module.exports = router;
