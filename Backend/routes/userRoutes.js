import { Router } from "express";
import { registerUser, loginUser, forgotPasswordController, resetPasswordController} from "../controllers/userController.js";
const userRoutes = Router()

//Registro de nuevos usuarios -> /auth/register
userRoutes.post("/auth/register", registerUser);

//Login de usuarios
userRoutes.post("/auth/login", loginUser);

//Recuperar contraseña
userRoutes.post('/auth/forgot-password', forgotPasswordController);

//Resetear contraseña
userRoutes.post('/auth/reset-password', resetPasswordController);

export default userRoutes;