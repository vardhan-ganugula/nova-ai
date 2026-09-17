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
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
      if (err || !user) {
        console.error('Google OAuth authentication failed:', err || info);
        const errMsg = err?.message || info?.message || 'Google authentication failed';
        return res.redirect(`${process.env.CLIENT_URL || ''}/signin?oauth=error&message=${encodeURIComponent(errMsg)}`);
      }
      req.user = user;
      return googleCallback(req, res);
    })(req, res, next);
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/?oauth=error' }), githubCallback);

export default router;
