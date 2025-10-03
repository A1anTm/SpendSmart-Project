    export const validateRegister = (f: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    }) => {
    const errors: Record<string, string> = {};

    if (!f.fullName) errors.fullName = 'El nombre es obligatorio';
    else if (f.fullName.length < 3) errors.fullName = 'El nombre debe tener al menos 3 caracteres';
    else if (f.fullName.length > 60) errors.fullName = 'El nombre no puede superar 60 caracteres';
    else if (!/^[a-zA-ZáéíóúüñÑ\s'-]+$/.test(f.fullName))
        errors.fullName = 'El nombre contiene caracteres no válidos';

    if (!f.email) errors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = 'Formato de correo inválido';

    if (!f.password) errors.password = 'La contraseña es obligatoria';
    else if (f.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(f.password))
        errors.password = 'Debe incluir mayúscula, minúscula, número y símbolo';

    if (f.password !== f.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';

    return errors;
    };

    export const validateLogin = (f: { email: string; password: string }) => {
    const errors: Record<string, string> = {};

    if (!f.email) errors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = 'Formato de correo inválido';

    if (!f.password) errors.password = 'La contraseña es obligatoria';

    return errors;
    };