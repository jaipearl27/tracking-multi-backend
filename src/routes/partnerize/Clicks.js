import express from 'express'
import { getPartnerizeClicks, getClicksCountAsPerCampaignId } from '../../controllers/partnerize/Clicks.js'
import { authenticateToken } from '../../middlewares/authenticateToken.js'

const partnerizeClicksRouter = express.Router()

partnerizeClicksRouter.route('/').get(authenticateToken, getPartnerizeClicks)
partnerizeClicksRouter.route('/total/:campaign_id').get(authenticateToken, getClicksCountAsPerCampaignId)

export default partnerizeClicksRouter