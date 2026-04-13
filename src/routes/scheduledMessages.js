const express = require('express')
const router = express.Router()
const supabase = require('../db')

router.patch('/:id', async (req, res) => {
  try {
    const { body, send_at } = req.body
    const updates = {}
    if (body !== undefined) updates.body = body
    if (send_at !== undefined) updates.send_at = send_at
    const { data, error } = await supabase
      .from('scheduled_messages')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, scheduled_message: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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
