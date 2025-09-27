import express from 'express';
import { createTransaction, updateTransaction, deleteTransaction, getTransactionsByFilter } from "../controllers/transactionsController.js";
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(isAuth); // todas necesitan autenticación

router.post('/', isAuth, createTransaction);
router.put('/:id', isAuth, updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/filter', isAuth, getTransactionsByFilter);

export default router;  