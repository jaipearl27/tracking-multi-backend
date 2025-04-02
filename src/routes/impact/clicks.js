import express from "express"
import { getClicks, getClicksCountAsPerProgramId, scheduleExportAPI } from "../../controllers/impact/clicks.js"


const clicksRouter = express.Router()

clicksRouter.route('/').get(getClicks).post(scheduleExportAPI)
clicksRouter.route('/total/:ProgramId').get(getClicksCountAsPerProgramId)

export default clicksRouter
