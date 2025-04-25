import express from 'express'
import { addConversion, getConversions } from '../../controllers/partnerize/Conversions.js'
import { authenticateToken } from '../../middlewares/authenticateToken.js'

const partnerizeConversionsRouter = express.Router()

partnerizeConversionsRouter.route('/').get(authenticateToken, getConversions).post(authenticateToken, addConversion)

export default partnerizeConversionsRouter