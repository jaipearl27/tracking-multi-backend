import express from 'express'
import { addConversion, getConversions } from '../../controllers/partnerize/Conversions.js'

const partnerizeConversionsRouter = express.Router()

partnerizeConversionsRouter.route('/').get(getConversions).post(addConversion)

export default partnerizeConversionsRouter