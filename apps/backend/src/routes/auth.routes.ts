import express from 'express';
import { body, validationResult } from 'express-validator';
import { User, Role } from '@test-pod/database';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import passport from '../config/passport';
import dotenv from 'dotenv';
import type { SessionUser } from '@test-pod/database';
import { getUserForSession } from '../utils/user';

dotenv.config();

const router: express.Router = express.Router();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
        validate
    ],
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        passport.authenticate('local', { session: false }, async (err: any, user: SessionUser, info: any) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.status(401).json({ message: info?.message || 'Invalid credentials' });
            }

            try {
                // Gerar token JWT com apenas os dados necessários
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: JWT_EXPIRES_IN } as SignOptions
                );

                res.json({ user, token });
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).json({ message: 'Error during login' });
            }
        })(req, res, next);
    }
);

router.post('/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        validate
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const existingUser = await User.findOne({ where: { email: req.body.email } });

            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            const user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                active: true
            });

            const defaultRole = await Role.findOne({ where: { name: 'User' } });

            if (defaultRole) {
                await user.addRole(defaultRole);
            }

            const sessionUser = await getUserForSession(user.id);

            if (!sessionUser) {
                return res.status(500).json({ message: 'Error creating session user' });
            }

            const token = jwt.sign(
                sessionUser,
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: JWT_EXPIRES_IN } as SignOptions
            );

            res.status(201).json({ user: sessionUser, token });
        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({ message: 'Error during registration' });
        }
    }
);

router.post('/verify',
    [
        body('token').notEmpty().withMessage('Token is required'),
        validate
    ],
    async (req: express.Request, res: express.Response) => {
        try {
            const decoded = jwt.verify(
                req.body.token,
                process.env.JWT_SECRET || 'your-secret-key'
            ) as { id: number, email: string };

            const sessionUser = await getUserForSession(decoded.id);

            if (!sessionUser || !sessionUser.active) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            res.json({ user: sessionUser });
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
);

router.get('/profile',
    passport.authenticate('jwt', { session: false }),
    async (req: express.Request, res: express.Response) => {
        try {
            const user = req.user as SessionUser;

            res.json({ user });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Error fetching profile' });
        }
    });

export default router;
