import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import { config } from 'dotenv';
config({ path: './Config/.env' });

const categories = [
  { name: 'Alimentos', appliesTo: 'gasto' },
  { name: 'Entretenimiento', appliesTo: 'gasto' },
  { name: 'Comida Fuera', appliesTo: 'gasto' },
  { name: 'Vivienda', appliesTo: 'gasto' },
  { name: 'Transporte', appliesTo: 'gasto' },
  { name: 'Salud', appliesTo: 'gasto' },
  { name: 'Educación', appliesTo: 'gasto' },
  { name: 'Otros', appliesTo: 'gasto' },
  { name: 'Salario', appliesTo: 'ingreso' },
  { name: 'Freelance', appliesTo: 'ingreso' },
  { name: 'Inversiones', appliesTo: 'ingreso' },
  { name: 'Ventas', appliesTo: 'ingreso' },
  { name: 'Otros Ingresos', appliesTo: 'ingreso' }
];

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    await Category.deleteMany();         
    await Category.insertMany(categories);
    console.log('✅ Categorías insertadas');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
