import express from 'express'
import { authenticateToken } from '../middlewares/authenticateToken.js'
import { getAssignmentMetrics, getImpactActionMetrics, getPartnerizeConversionMetrics, getRecentAssignmentsMetrics, getUserRegisterationMetrics, getWithdrawalMetrics } from '../controllers/dashboard.js'


const router = express.Router()

router.route('/assignments').get(authenticateToken, getAssignmentMetrics)
router.route('/assignments/recent').get(authenticateToken, getRecentAssignmentsMetrics)
router.route('/withdrawals').get(authenticateToken, getWithdrawalMetrics)
router.route('/users').get(authenticateToken, getUserRegisterationMetrics)
router.route('/conversions/partnerize').get(authenticateToken, getPartnerizeConversionMetrics)
router.route('/conversions/impact').get(authenticateToken, getImpactActionMetrics)




export default router;