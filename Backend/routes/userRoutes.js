import { Router } from "express";
import { registerUser, loginUser, forgotPasswordController, resetPasswordController, getProfile, updateProfile, changePassword } from "../controllers/userController.js";
import { isAuth } from "../middlewares/auth.js";   

const userRoutes = Router();

/* ---- rutas públicas ---- */
userRoutes.post("/auth/register", registerUser);
userRoutes.post("/auth/login", loginUser);
userRoutes.post("/auth/forgot-password", forgotPasswordController);
userRoutes.post("/auth/reset-password", resetPasswordController);

/* ---- rutas privadas (perfil) ---- */
userRoutes.get("/", isAuth, getProfile);               
userRoutes.put("/change-password", isAuth, changePassword); 
userRoutes.put("/", isAuth, updateProfile);            

export default userRoutes;