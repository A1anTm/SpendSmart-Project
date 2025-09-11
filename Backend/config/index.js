import express, { json } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {config} from 'dotenv';



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


try {
    mongoose.connect(process.env.DATABASE_URL);
} catch (error) {
    
}


app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})