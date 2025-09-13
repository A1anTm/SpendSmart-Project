import express from 'express';
import { createTransaction, updateTransaction, getUserTransactions, deleteTransaction, getSummaryByCategory } from "../controllers/transactionsController.js";
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(isAuth); // todas necesitan autenticación

router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.get('/', getUserTransactions);
router.delete('/:id', deleteTransaction);
router.get('/summary', getSummaryByCategory);

export default router;