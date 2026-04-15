const express = require('express')
const router = express.Router()
const { getDrips, createDrip, updateDrip, deleteDrip } = require('../controllers/dripsController')

router.get('/', getDrips)
router.post('/', createDrip)
router.patch('/:id', updateDrip)
router.delete('/:id', deleteDrip)

module.exports = router
