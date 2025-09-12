// routes/budgetRoutes.js
import express from 'express';
import * as ctrl from '../controllers/budgetController.js';
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();
router.use(isAuth);

router.post('/', ctrl.createBudget);                 // agregar
router.put('/:id', ctrl.updateBudget);               // editar
router.get('/', ctrl.listBudgets);                   // listar + resumen
router.patch('/:id/toggle', ctrl.toggleBudget);      // activar/desactivar
router.delete('/:id', ctrl.deleteBudget);            // eliminar
router.put('/alerts/config', ctrl.updateAlertSettings); // config notis

export default router;