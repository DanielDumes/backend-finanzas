// backend/controllers/authController.js
const User   = require('../models/User');
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ success: false, message: 'Completa todos los campos.' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });

    const existe = await User.findOne({ email });
    if (existe)
      return res.status(400).json({ success: false, message: 'Ya existe una cuenta con ese email.' });

    // Generar token de verificación
    const tokenVerificacion = crypto.randomBytes(32).toString('hex');
    const tokenExpira       = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      nombre, email, password,
      verificado: false,
      tokenVerificacion,
      tokenExpira,
    });

    // Enviar email
    await sendVerificationEmail(email, nombre, tokenVerificacion);

    res.status(201).json({
      success: true,
      message: 'Cuenta creada. Revisa tu email para verificarla.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Completa todos los campos.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });

    if (!user.verificado)
      return res.status(403).json({ success: false, message: 'Debes verificar tu email antes de iniciar sesión.' });

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { _id: user._id, nombre: user.nombre, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/verificar?token=xxx
const verificarEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      tokenVerificacion: token,
      tokenExpira: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });

    user.verificado         = true;
    user.tokenVerificacion  = null;
    user.tokenExpira        = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Cuenta verificada. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, verificarEmail, getMe };  