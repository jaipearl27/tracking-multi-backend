import express from "express"
import { getClicks, getClicksCountAsPerProgramId, scheduleExportAPI } from "../../controllers/impact/clicks.js"
import { authenticateToken } from "../../middlewares/authenticateToken.js"


const clicksRouter = express.Router()

clicksRouter.route('/').get(authenticateToken, getClicks).post(authenticateToken, scheduleExportAPI)
clicksRouter.route('/total/:ProgramId').get(authenticateToken, getClicksCountAsPerProgramId)

export default clicksRouter
