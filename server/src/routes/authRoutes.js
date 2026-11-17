import express from 'express';
import { register, login, demoLogin, getMe, logout, registerSchema, loginSchema } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
