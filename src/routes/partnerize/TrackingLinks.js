import express from "express"
import { getTrackingLinks, addTrackingLinkToDB, getTrackingLinkByCampaignId, deleteTrackingLink } from "../../controllers/partnerize/TrackingLinks.js"

const partnerizeTrackingLinkRouter = express.Router()

partnerizeTrackingLinkRouter.route('/').get(getTrackingLinks).post(addTrackingLinkToDB)
partnerizeTrackingLinkRouter.route('/campaign/:campaign_id').get(getTrackingLinkByCampaignId)
partnerizeTrackingLinkRouter.route('/:id').delete(deleteTrackingLink)

export default partnerizeTrackingLinkRouter