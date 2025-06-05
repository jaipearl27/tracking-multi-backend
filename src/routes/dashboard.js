import express from 'express'
import { authenticateToken } from '../middlewares/authenticateToken.js'
import { getAssignmentMetrics } from '../controllers/dashboard.js'


const router = express.Router()

router.route('/assignments').get(authenticateToken, getAssignmentMetrics)

export default router;