
import { Hono } from 'hono';
import { validate } from '@/middleware/zod.middleware';
import { loginSchema, registerSchema } from '@/validator/auth.validator';
import { login, logout, refreshToken, register } from '@/controllers/auth/auth.controller';

const app = new Hono()
    .post('/login', validate(loginSchema), login)
    .post('/register', validate(registerSchema), register)
    .post('/refresh', refreshToken)
    .post('/logout', logout);

export default app;
