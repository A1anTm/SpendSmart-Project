import express from 'express';
import * as ctrl from '../controllers/savingsGoalController.js';
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();
router.use(isAuth); // proteger rutas

router.post('/', ctrl.createSavingsGoal);        // crear
router.get('/', ctrl.getUserGoals);              // listar
router.put('/:id', ctrl.updateSavingsGoal);      // editar
router.delete('/:id', ctrl.deleteSavingsGoal);   // eliminar (soft)

export default router;