import User from "../models/userModel.js";
import { generatetoken } from "../middlewares/auth.js"
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();

/* ---------- 1. REGISTER ---------- */
export const registerUser = async (req, res) => {
    const { full_name, username, email, password } = req.body;

    console.info(`[REGISTER] Intentando registrar usuario: ${email}`);

    try {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            console.warn(`[REGISTER] Email duplicado: ${email}`);
            if (existingEmailUser.is_deleted) {
                return res.status(400).json({
                    message: "Este correo electrónico pertenece a un usuario eliminado.",
                });
            }
            return res.status(409).json({ message: "El correo electrónico ya está en uso." });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.warn(`[REGISTER] Username duplicado: ${username}`);
            if (existingUser.is_deleted) {
                return res.status(400).json({
                    message: "Este nombre de usuario pertenece a un usuario eliminado.",
                });
            }
            return res.status(409).json({ message: "El nombre de usuario ya está en uso." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ full_name: full_name.trim(), username, email, password: hashedPassword });
        await newUser.save();

        console.info(`[REGISTER] Usuario creado: ${newUser._id} (${email})`);

        res.status(200).json({ message: 'Usuario creado exitosamente.' });
    } catch (error) {
        console.error("[REGISTER] Error interno:", error);
        res.status(500).json({ message: error.message });
    }
};


/* ---------- 2. LOGIN ---------- */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.info(`[LOGIN] Intento de acceso para: ${email}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`[LOGIN] Email no existe: ${email}`);
            return res.status(404).json({ email: 'Email incorrecto' });
        }

        if (user.is_deleted) {
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
        return res.status(200).json({ message: 'Usuario logueado exitosamente.', token });
    } catch (error) {
        console.error('[LOGIN] Error interno:', error);
        return res.status(500).json({ name: error.name, error: error.message });
    }
};


/* ---------- 3. FORGOT PASSWORD ---------- */
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

/* ---------- 4. RESET PASSWORD ---------- */
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


/* ---------- 5. VER PERFIL ---------- */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('full_name email username birthdate phone_number country address social_accounts bio')
      .lean(); // más rápido y limpio

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

/* ---------- 6. EDITAR PERFIL ---------- */
export const updateProfile = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      phone_number,
      birthdate,
      country,
      bio,
      address,
      social_accounts
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        full_name,
        username,
        email,
        phone_number,
        birthdate,
        country,
        bio,
        address,
        social_accounts
      },
      { new: true, runValidators: true }
    ).select('_id'); // solo necesitamos saber que existe

    if (!updated) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({ message: 'Perfil actualizado con éxito' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

/* ---------- 7. CAMBIAR CONTRASEÑA ---------- */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Faltan contraseñas' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

    // Verificar que no repita contraseñas anteriores
    const repeated = await Promise.all(
      user.password_history.map(async (ph) => bcrypt.compare(newPassword, ph.password))
    );
    if (repeated.some(Boolean)) {
      return res.status(409).json({ message: 'No puedes reutilizar una contraseña anterior' });
    }

    // Guardar contraseña actual en historial
    user.password_history.push({ password: user.password, changed_in: new Date() });

    // Actualizar contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Contraseña actualizada con éxito' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};