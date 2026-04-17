const express = require('express')
const router = express.Router()
const {
  getConversations,
  getConversation,
  updateConversation,
  starConversation,
  getScheduledMessages,
  createScheduledMessage,
  getConversationMessages,
  markConversationRead,
  deleteConversation,
  searchConversations,
  getArchivedMessages
} = require('../controllers/conversationsController')

router.get('/', getConversations)
router.get('/search', searchConversations)
router.get('/:id', getConversation)
router.patch('/:id', updateConversation)
router.patch('/:id/star', starConversation)
router.patch('/:id/read', markConversationRead)
router.get('/:id/messages', getConversationMessages)
router.get('/:id/archived-messages', getArchivedMessages)
router.delete('/:id', deleteConversation)
router.get('/:id/scheduled', getScheduledMessages)
router.post('/:id/scheduled', createScheduledMessage)

module.exports = router
