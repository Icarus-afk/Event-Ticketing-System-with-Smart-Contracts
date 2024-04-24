const passwordStrength = (req, res, next) => {
    const password = req.body.password;

    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required', statusCode:400});
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*,]/.test(password);

    if (password.length < 8 || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return res.status(400).json({ success: false, message: 'Password is not strong enough', stausCode:400});
    }

    next();
};

export default passwordStrength;