import express from 'express'
import { authenticateToken } from '../middlewares/authenticateToken.js'
import { getAssignmentMetrics, getWithdrawalMetrics } from '../controllers/dashboard.js'


const router = express.Router()

router.route('/assignments').get(authenticateToken, getAssignmentMetrics)
router.route('/withdrawals').get(authenticateToken, getWithdrawalMetrics)


export default router;