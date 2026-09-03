const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.get('/auth/login', ensureGuest, authController.getLogin);
router.post('/auth/login', ensureGuest, authController.postLogin);
router.get('/auth/register', ensureGuest, authController.getRegister);
router.post('/auth/register', ensureGuest, authController.postRegister);
router.get('/auth/logout', authController.logout);

router.get('/profile', ensureAuth, authController.getProfile);
router.post('/profile', ensureAuth, authController.updateProfile);

router.get('/wishlist', ensureAuth, authController.getWishlist);
router.post('/wishlist/toggle/:productId', ensureAuth, authController.toggleWishlist);

module.exports = router;
