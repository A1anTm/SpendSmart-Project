import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {config} from 'dotenv';

//Rutas
import userRoutes  from '../routes/userRoutes.js'
import transactionRoutes from '../routes/transactionsRoutes.js'
import budgetRoutes from '../routes/budgetsRoutes.js'



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



try {
    mongoose.connect(process.env.DATABASE_URL);
} catch (error) {
    
}


app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})