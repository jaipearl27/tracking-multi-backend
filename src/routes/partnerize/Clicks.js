import express from 'express'
import { getPartnerizeClicks, getClicksCountAsPerCampaignId } from '../../controllers/partnerize/Clicks.js'

const partnerizeClicksRouter = express.Router()

partnerizeClicksRouter.route('/').get(getPartnerizeClicks)
partnerizeClicksRouter.route('/total/:campaign_id').get(getClicksCountAsPerCampaignId)

export default partnerizeClicksRouter