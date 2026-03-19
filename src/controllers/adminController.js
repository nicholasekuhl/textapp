const supabase = require('../db')

const getUsers = async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, email, agent_name, agency_name, created_at, is_suspended, suspended_at, suspended_reason, is_admin')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch lead counts and message counts per user in parallel
    const userIds = profiles.map(p => p.id)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [{ data: leadCounts }, { data: msgCounts }] = await Promise.all([
      supabase.from('leads').select('user_id').in('user_id', userIds),
      supabase.from('messages')
        .select('conversation_id, conversations!inner(user_id)')
        .eq('direction', 'outbound')
        .gte('sent_at', monthStart.toISOString())
    ])

    const leadCountMap = {}
    for (const l of leadCounts || []) {
      leadCountMap[l.user_id] = (leadCountMap[l.user_id] || 0) + 1
    }

    const msgCountMap = {}
    for (const m of msgCounts || []) {
      const uid = m.conversations?.user_id
      if (uid) msgCountMap[uid] = (msgCountMap[uid] || 0) + 1
    }

    const users = profiles.map(p => ({
      ...p,
      lead_count: leadCountMap[p.id] || 0,
      message_count_this_month: msgCountMap[p.id] || 0
    }))

    res.json({ users })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason?.trim()) return res.status(400).json({ error: 'Reason is required' })
    if (id === req.user.id) return res.status(400).json({ error: 'You cannot suspend your own account' })

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_suspended: true, suspended_at: new Date().toISOString(), suspended_reason: reason.trim() })
      .eq('id', id)

    if (error) throw error

    // Invalidate all their Supabase auth sessions
    await supabase.auth.admin.signOut(id, 'global').catch(() => {})

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_suspended: false, suspended_at: null, suspended_reason: null })
      .eq('id', id)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const { confirm } = req.body

    if (confirm !== 'DELETE') return res.status(400).json({ error: 'Confirmation required' })
    if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' })

    // Delete in dependency order
    // messages → via conversations
    const { data: convs } = await supabase.from('conversations').select('id').eq('user_id', id)
    const convIds = (convs || []).map(c => c.id)
    if (convIds.length) await supabase.from('messages').delete().in('conversation_id', convIds)

    await Promise.all([
      supabase.from('conversations').delete().eq('user_id', id),
      supabase.from('campaign_leads').delete().eq('user_id', id),
      supabase.from('leads').delete().eq('user_id', id),
      supabase.from('campaign_messages').delete().in('campaign_id',
        (await supabase.from('campaigns').select('id').eq('user_id', id)).data?.map(c => c.id) || []
      ),
      supabase.from('phone_numbers').delete().eq('user_id', id),
      supabase.from('notifications').delete().eq('user_id', id),
      supabase.from('invites').delete().eq('invited_by', id),
    ])

    await supabase.from('campaigns').delete().eq('user_id', id)
    await supabase.from('user_profiles').delete().eq('id', id)
    await supabase.auth.admin.deleteUser(id)

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getUsers, suspendUser, unsuspendUser, deleteUser }
