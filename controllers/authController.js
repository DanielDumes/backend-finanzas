const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado.' });
    }

    const user = await User.create({ nombre, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: `Bienvenido, ${user.nombre}`,
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: { id: req.user._id, nombre: req.user.nombre, email: req.user.email },
  });
};

module.exports = { register, login, getMe };
