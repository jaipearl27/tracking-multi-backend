import express from "express"
import { getTrackingLinks, addTrackingLinkToDB } from "../../controllers/partnerize/TrackingLinks.js"

const partnerizeTrackingLinkRouter = express.Router()

partnerizeTrackingLinkRouter.route('/').get(getTrackingLinks).post(addTrackingLinkToDB)

export default partnerizeTrackingLinkRouter