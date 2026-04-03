const express = require('express')
const router = express.Router()
const { authMiddleware, authMiddlewareNoTos } = require('../middleware/auth')
const {
  login, logout, getMe, updateProfile, signup, authCallback,
  inviteAgent, validateToken, signupWithToken, getInvites,
  cancelInvite, forgotPassword, resetPassword, agreeTos
} = require('../controllers/authController')

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getMe)
router.patch('/me', authMiddleware, updateProfile)
router.post('/signup', signup)
router.get('/callback', authCallback)
router.post('/invite', authMiddleware, inviteAgent)
router.get('/invite/:token', validateToken)
router.post('/signup-with-token', signupWithToken)
router.get('/invites', authMiddleware, getInvites)
router.delete('/invites/:id', authMiddleware, cancelInvite)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/agree-tos', authMiddlewareNoTos, agreeTos)

module.exports = router
