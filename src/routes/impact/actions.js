import express from "express"
import { addAction, getActionById, getActions, getActionsByCampaignId } from "../../controllers/impact/actions.js"

const actionsRouter = express.Router()

actionsRouter.route('/').get(getActions).post(addAction)
actionsRouter.route('/:id').get(getActionById)
actionsRouter.route('/campaign/:id').get(getActionsByCampaignId)

export default actionsRouter