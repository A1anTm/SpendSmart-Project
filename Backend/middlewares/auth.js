import jwt from 'jsonwebtoken';


//Generar token
export const generatetoken = (user) => {
    console.info('[generatetoken] Generando token para usuario:', user.email);
    const token = jwt.sign(
        {
            _id: user._id,
            name: user.username,
            lastName: user.lastName,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1440m",
        }
    );
    console.info('[generatetoken] Token generado exitosamente', token);
    return token;
};

// Verificar autenticación
export const isAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.info('[isAuth] No se recibió token en los headers');
        return res.status(401).json({ message: 'Token no enviado.' });
    }

    try {
        console.info('[isAuth] Verificando token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('Token decodificado:', decoded);

        req.user = decoded;
        console.info('[isAuth] Token válido. Usuario autenticado:', decoded.email);

        next();
    } catch (error) {
        console.error('[isAuth] Error al verificar el token:', error);
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};


//generar token Email
export const generateTokenEmail = (userId) => {
    console.info('[generateTokenEmail] Generando token de restablecimiento para userId:', userId);
    const token = jwt.sign({ id: userId }, process.env.PASSWORD, { expiresIn: '10m' });
    console.info('[generateTokenEmail] Token de restablecimiento generado', token);
    return token;
};