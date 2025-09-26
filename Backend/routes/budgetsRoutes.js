import express from 'express';
import {createBudget, updateBudget, listBudgets, toggleBudget, deleteBudget} from "../controllers/budgetsController.js";
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();
router.use(isAuth);

router.post('/', createBudget);                 // agregar
router.put('/:id', updateBudget);               // editar
router.get('/', listBudgets);                   // listar + resumen
router.patch('/:id/toggle', toggleBudget);      // activar/desactivar
router.delete('/:id', deleteBudget);            // eliminar

export default router;