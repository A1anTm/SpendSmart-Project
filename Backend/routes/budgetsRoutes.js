import express from 'express';
import {createBudget, updateBudget, listBudgets, toggleBudget, deleteBudget} from "../controllers/budgetsController.js";
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', isAuth, createBudget);                 
router.put('/:id', isAuth, updateBudget);               
router.get('/', isAuth, listBudgets);                   
router.patch('/:id/toggle', isAuth, toggleBudget);      
router.delete('/:id', isAuth, deleteBudget);            

export default router;