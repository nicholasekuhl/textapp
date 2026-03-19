const express = require('express')
const router = express.Router()
const { getUsers, suspendUser, unsuspendUser, deleteUser } = require('../controllers/adminController')

router.get('/users', getUsers)
router.post('/users/:id/suspend', suspendUser)
router.post('/users/:id/unsuspend', unsuspendUser)
router.delete('/users/:id', deleteUser)

module.exports = router
