const supabase = require('../db')

const getTemplates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', req.user.id)
      .order('sort_order', { ascending: true })
    if (error) throw error
    res.json({ templates: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createTemplate = async (req, res) => {
  try {
    const { name, body } = req.body
    if (!name) return res.status(400).json({ error: 'Template name is required' })
    if (!body) return res.status(400).json({ error: 'Template body is required' })
    const { data, error } = await supabase
      .from('templates')
      .insert({ name, body, user_id: req.user.id })
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, template: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateTemplate = async (req, res) => {
  try {
    const { name, body } = req.body
    const { data, error } = await supabase
      .from('templates')
      .update({ name, body })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, template: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteTemplate = async (req, res) => {
  try {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const reorderTemplates = async (req, res) => {
  try {
    const { order } = req.body
    if (!order || !Array.isArray(order)) return res.status(400).json({ error: 'Invalid order data' })
    await Promise.all(
      order.map(({ id, sort_order }) =>
        supabase.from('templates').update({ sort_order }).eq('id', id).eq('user_id', req.user.id)
      )
    )
    res.json({ success: true })
  } catch (err) {
    console.error('Reorder error:', err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getTemplates, createTemplate, updateTemplate, deleteTemplate, reorderTemplates }
