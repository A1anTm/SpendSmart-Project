import express from 'express';
import { createSavingsGoal, getUserGoals, updateSavingsGoal, deleteSavingsGoal} from "../controllers/savingsGoalsController.js";
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();
router.use(isAuth); // proteger rutas

router.post('/', createSavingsGoal);        // crear
router.get('/', getUserGoals);              // listar
router.put('/:id', updateSavingsGoal);      // editar
router.delete('/:id', deleteSavingsGoal);   // eliminar (soft)

export default router;