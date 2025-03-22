import express from "express"
import { getClicks, scheduleExportAPI } from "../controllers/clicks.js"

const clicksRouter = express.Router()

clicksRouter.route('/').get(getClicks).post(scheduleExportAPI)

export default clicksRouter
