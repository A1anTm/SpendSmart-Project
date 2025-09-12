import User from "../models/userModel.js";
import { generatetoken } from "../middlewares/auth.js"
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();

//Register
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    console.info(`[REGISTER] Intentando registrar usuario: ${email}`);

    try {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            console.warn(`[REGISTER] Email duplicado: ${email}`);
            if (existingEmailUser.Isdeleted) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Este correo electrónico pertenece a un usuario eliminado.",
                    });
            }
            return res
                .status(409)
                .json({ message: "El correo electrónico ya está en uso." });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.warn(`[REGISTER] Username duplicado: ${username}`); 
            if (existingUser.Isdeleted) {
                return res
                    .status(400)
                    .json({
                        message: "Este nombre de usuario pertenece a un usuario eliminado.",
                    });
            }
            return res
                .status(409)
                .json({ message: "El nombre de usuario ya está en uso." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        console.info(`[REGISTER] Usuario creado: ${newUser._id} (${email})`);

        res.status(201).json(newUser);
    } catch (error) {
        console.error("[REGISTER] Error interno:", error);
        res.status(500).json({ message: error.message });
    }
};


// LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.info(`[LOGIN] Intento de acceso para: ${email}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`[LOGIN] Email no existe: ${email}`);
            return res.status(404).json({ email: 'Email incorrecto' });
        }

        if (user.Isdeleted) {
            console.warn(`[LOGIN] Usuario eliminado intentó acceder: ${email}`);
            return res.status(400).json({ message: 'Este usuario ha sido eliminado y no puede iniciar sesión.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.warn(`[LOGIN] Contraseña incorrecta: ${email}`);
            return res.status(404).json({ password: 'Contraseña incorrecta' });
        }

        const token = generatetoken(user);
        console.info(`[LOGIN] Login exitoso: ${email} (id: ${user._id})`);
        return res.status(200).json({ user: { _id: user._id, email: user.email, username: user.username }, token });
    } catch (error) {
        console.error('[LOGIN] Error interno:', error);
        return res.status(500).json({ name: error.name, error: error.message });
    }
};


// FORGOT-PASSWORD
export const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    console.info(`[FORGOT-PASSWORD] Solicitud para: ${email}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`[FORGOT-PASSWORD] Email no encontrado: ${email}`);
            return res.status(404).json({ message: 'No se encontró un usuario con ese correo electrónico.' });
        }

        const resetPasswordToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetPasswordExpires = Date.now() + 3600000;

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperación de Contraseña',
            html: `<p>Para restablecer su contraseña, ingrese el siguiente código:</p><p><strong>${resetPasswordToken}</strong></p>`,
        };

        await transporter.sendMail(mailOptions);
        console.info(`[FORGOT-PASSWORD] Código enviado a: ${email} -> ${resetPasswordToken}`);

        res.status(200).json({ message: 'Se ha enviado el código de recuperación de contraseña.' });
    } catch (error) {
        console.error('[FORGOT-PASSWORD] Error al enviar correo:', error);
        res.status(500).json({ message: 'Error al enviar el correo.' });
    }
};

// RESET-PASSWORD
export const resetPasswordController = async (req, res) => {
    const { code, password } = req.body;
    console.info(`[RESET-PASSWORD] Solicitud con código: ${code}`);

    try {
        const user = await User.findOne({ resetPasswordToken: code, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            console.warn(`[RESET-PASSWORD] Código inválido o expirado: ${code}`);
            return res.status(400).json({ message: 'Código inválido o ha expirado.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.info(`[RESET-PASSWORD] Contraseña actualizada para: ${user.email}`);
        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        console.error('[RESET-PASSWORD] Error interno:', error);
        res.status(500).json({ message: 'Error al restablecer la contraseña.' });
    }
};