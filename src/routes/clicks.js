import express from "express"
import { getClicks } from "../controllers/clicks.js"

const clicksRouter = express.Router()

clicksRouter.route('/').get(getClicks)

export default clicksRouter
