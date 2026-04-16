const express = require('express')
const router = express.Router()
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  enrollLeads,
  enrollBucket,
  startCampaign,
  pauseCampaign,
  duplicateCampaign
} = require('../controllers/campaignsController')

// Compliance acknowledgment log — must be before /:id routes
const supabase = require('../db')
router.post('/compliance-log', async (req, res) => {
  try {
    const { campaign_id, campaign_name, lead_count } = req.body
    await supabase.from('compliance_log').insert({
      user_id: req.user.id,
      event_type: 'campaign_consent',
      event_detail: JSON.stringify({
        campaign_id,
        campaign_name,
        lead_count,
        acknowledged_at: new Date().toISOString()
      })
    })
    res.json({ success: true })
  } catch (err) {
    console.error('[compliance] campaign consent log error:', err.message)
    res.json({ success: false })
  }
})

router.get('/', getCampaigns)
router.get('/:id', getCampaign)
router.post('/', createCampaign)
router.put('/:id', updateCampaign)
router.delete('/:id', deleteCampaign)
router.post('/:id/enroll', enrollLeads)
router.post('/:id/enroll-bucket/:bucketId', enrollBucket)
router.post('/:id/start', startCampaign)
router.post('/:id/pause', pauseCampaign)
router.post('/:id/duplicate', duplicateCampaign)

module.exports = router