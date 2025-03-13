import express from "express"
import { scheduleClickExport } from "../controllers/clicks.js"

const clicksRouter = express.Router()

clicksRouter.route('/').post(scheduleClickExport)

export default clicksRouter
