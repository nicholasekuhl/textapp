const express = require('express')
const router = express.Router()
const { getTemplates, createTemplate, updateTemplate, deleteTemplate, reorderTemplates } = require('../controllers/templatesController')

router.get('/', getTemplates)
router.post('/reorder', reorderTemplates)
router.post('/', createTemplate)
router.put('/:id', updateTemplate)
router.delete('/:id', deleteTemplate)

module.exports = router