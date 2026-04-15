const express = require('express')
const router = express.Router()
const { getUsers, getStats, suspendUser, unsuspendUser, deleteUser, getComplianceOverrides, addUserCredits, backfillStatuses, getAccessRequests, inviteFromAccessRequest, declineAccessRequest } = require('../controllers/adminController')

router.get('/stats', getStats)
router.get('/users', getUsers)
router.post('/users/:id/suspend', suspendUser)
router.post('/users/:id/unsuspend', unsuspendUser)
router.delete('/users/:id', deleteUser)
router.get('/compliance-overrides', getComplianceOverrides)
router.post('/users/:id/credits', addUserCredits)
router.post('/backfill-statuses', backfillStatuses)
router.get('/access-requests', getAccessRequests)
router.post('/access-requests/:id/invite', inviteFromAccessRequest)
router.post('/access-requests/:id/decline', declineAccessRequest)

module.exports = router
