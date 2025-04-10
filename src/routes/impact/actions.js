import express from "express"
import { addAction, getActionById, getActions, getActionsByCampaignId, getActionsByUserId, getActionsForUser } from "../../controllers/impact/actions.js"
import { authenticateToken } from "../../middlewares/authenticateToken.js"

const actionsRouter = express.Router()

actionsRouter.route('/').get(getActions).post(addAction)
actionsRouter.route('/user').get(authenticateToken, getActionsForUser)
actionsRouter.route('/user/:id').get(getActionsByUserId)
actionsRouter.route('/campaign/:id').get(getActionsByCampaignId)
actionsRouter.route('/:id').get(getActionById)

export default actionsRouter