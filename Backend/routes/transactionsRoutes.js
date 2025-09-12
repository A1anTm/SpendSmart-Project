import express from 'express';
import * as ctrl from '../controllers/transactionController.js';
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(isAuth); // todas necesitan autenticación

router.post('/', ctrl.createTransaction);
router.put('/:id', ctrl.updateTransaction);
router.get('/', ctrl.getUserTransactions);
router.delete('/:id', ctrl.deleteTransaction);
router.get('/summary', ctrl.getSummaryByCategory);

export default router;