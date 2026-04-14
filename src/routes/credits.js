const express = require('express')
const router = express.Router()
const supabase = require('../db')
const { getBalance } = require('../services/credits')

// GET /api/credits/balance
router.get('/balance', async (req, res) => {
  try {
    const { data } = await supabase
      .from('user_credits')
      .select('balance, lifetime_purchased, lifetime_used, updated_at')
      .eq('user_id', req.user.id)
      .single()

    res.json({
      balance:            data ? parseFloat(data.balance) : 0,
      lifetime_purchased: data ? parseFloat(data.lifetime_purchased) : 0,
      lifetime_used:      data ? parseFloat(data.lifetime_used) : 0,
      updated_at:         data?.updated_at || null
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/credits/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('id, amount, type, description, balance_after, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    res.json({ transactions: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
