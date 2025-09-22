import express from 'express';
import { listCategories } from '../controllers/categoryController.js';
import { isAuth } from '../middlewares/auth.js';

const router = express.Router();
router.get('/', isAuth, listCategories);   // GET /api/categories?type=gasto
export default router;