import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {config} from 'dotenv';

//Rutas
import userRoutes  from '../routes/userRoutes.js'
import transactionRoutes from '../routes/transactionsRoutes.js'
import budgetRoutes from '../routes/budgetsRoutes.js'
import savingsGoalRoutes from '../routes/savingsGoalsRoutes.js'
import summaryRoutes from '../routes/summaryRoutes.js'
import categoryRoutes from '../routes/categoryRoutes.js'



config({path: './Config/.env'});

const corsOption = {
    origin: ["http://localhost:3000"], 
    optionsSuccessStatus: 200, 
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"] ,
    credentials: true
}


const app = express();
app.use(cors(corsOption))

const port = process.env.PORT


app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/savings-goals", savingsGoalsRoutes); 
app.use("/api/categories", categoryRoutes);



mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
});



app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})