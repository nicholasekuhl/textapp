const express = require('express')
const router = express.Router()
const { getBuckets, createBucket, updateBucket, deleteBucket } = require('../controllers/bucketsController')

router.get('/', getBuckets)
router.post('/', createBucket)
router.put('/:id', updateBucket)
router.delete('/:id', deleteBucket)

module.exports = router
