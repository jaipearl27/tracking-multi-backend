import express from "express"
import { getTrackingLinks, addTrackingLinkToDB, getTrackingLinkByCampaignId, deleteTrackingLink } from "../../controllers/partnerize/TrackingLinks.js"
import { authenticateToken } from "../../middlewares/authenticateToken.js"

const partnerizeTrackingLinkRouter = express.Router()

partnerizeTrackingLinkRouter.route('/').get(authenticateToken, getTrackingLinks).post(authenticateToken, addTrackingLinkToDB)
partnerizeTrackingLinkRouter.route('/campaign/:campaign_id').get(authenticateToken, getTrackingLinkByCampaignId)
partnerizeTrackingLinkRouter.route('/:id').delete(authenticateToken, deleteTrackingLink)

export default partnerizeTrackingLinkRouter