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
    origin: ["http://localhost:3002"], 
    optionsSuccessStatus: 200, 
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"] 
}


const app = express();
app.use(cors(corsOption))

const port = process.env.PORT


app.use(express.json());

app.use("/Users", userRoutes)
app.use("/Transactions", transactionRoutes)
app.use("/Budgets", budgetRoutes)
app.use("/Summary", summaryRoutes)
app.use("/SavingsGoals", savingsGoalRoutes)
app.use("/Categories", categoryRoutes)



mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
});



app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})