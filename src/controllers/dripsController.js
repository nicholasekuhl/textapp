const supabase = require('../db')

const getDrips = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('disposition_drips')
      .select('*, disposition_tags (id, name, color)')
      .eq('user_id', req.user.id)
      .order('disposition_tag_id', { ascending: true })
      .order('day_number', { ascending: true })
    if (error) throw error
    res.json({ drips: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createDrip = async (req, res) => {
  try {
    const { disposition_tag_id, message_body, day_number, send_time } = req.body
    if (!disposition_tag_id) return res.status(400).json({ error: 'Disposition tag is required' })
    if (!message_body || !message_body.trim()) return res.status(400).json({ error: 'Message body is required' })
    if (day_number === undefined || day_number === null) return res.status(400).json({ error: 'Day number is required' })
    if (!send_time) return res.status(400).json({ error: 'Send time is required' })

    const { data: drip, error } = await supabase
      .from('disposition_drips')
      .insert({
        user_id: req.user.id,
        disposition_tag_id,
        message_body: message_body.trim(),
        day_number: parseInt(day_number),
        send_time
      })
      .select('*, disposition_tags (id, name, color)')
      .single()
    if (error) throw error
    res.json({ success: true, drip })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateDrip = async (req, res) => {
  try {
    const updates = {}
    const { disposition_tag_id, message_body, day_number, send_time } = req.body
    if (disposition_tag_id !== undefined) updates.disposition_tag_id = disposition_tag_id
    if (message_body !== undefined) updates.message_body = message_body.trim()
    if (day_number !== undefined) updates.day_number = parseInt(day_number)
    if (send_time !== undefined) updates.send_time = send_time

    const { data: drip, error } = await supabase
      .from('disposition_drips')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*, disposition_tags (id, name, color)')
      .single()
    if (error) throw error
    res.json({ success: true, drip })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteDrip = async (req, res) => {
  try {
    const { error } = await supabase
      .from('disposition_drips')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getDrips, createDrip, updateDrip, deleteDrip }
