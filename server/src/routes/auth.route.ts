import { Router } from 'express';
import passport from '@utils/passport.util.js';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  verifyEmail, 
  googleCallback, 
  githubCallback, 
  sendVerificationEmail,
  updateProfile,
  changePassword 
} from '@/controllers/auth.controller.js';
import { requireAuth } from '@/middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', getMe);
router.get('/verify-email', verifyEmail);
router.patch('/profile', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);

router.post('/send-verification-email', sendVerificationEmail);


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/?oauth=error' }), googleCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/?oauth=error' }), githubCallback);

export default router;
