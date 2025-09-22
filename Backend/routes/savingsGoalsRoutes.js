import express from 'express';
import { createSavingsGoal, getUserGoals, updateSavingsGoal, deleteSavingsGoal, addMoneyToGoal } from "../controllers/savingsGoalsController.js";
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();
router.use(isAuth); // proteger rutas

router.post('/', createSavingsGoal);        // crear
router.get('/', getUserGoals);              // listar
router.put('/:id', updateSavingsGoal);      // editar
router.patch('/:id/add-money', addMoneyToGoal); // agregar dinero
router.delete('/:id', deleteSavingsGoal);   // eliminar (soft)

export default router;
