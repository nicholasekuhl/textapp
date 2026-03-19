const express = require('express')
const router = express.Router()
const supabase = require('../db')

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('scheduled_messages')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
