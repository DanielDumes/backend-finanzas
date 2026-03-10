// backend/routes/goals.js
const express = require('express');
const router  = express.Router();
const {
  getGoals,
  createGoal,
  abonarGoal,
  deleteGoal,
  updateGoal,
} = require('../controllers/goalController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/',          getGoals);
router.post('/',         createGoal);
router.put('/:id',       updateGoal);
router.put('/:id/abonar', abonarGoal);
router.delete('/:id',    deleteGoal);

module.exports = router;