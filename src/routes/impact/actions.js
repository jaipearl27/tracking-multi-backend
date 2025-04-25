import express from "express"
import { addAction, getActionById, getActions, getActionsByCampaignId, getActionsByUserId, getActionsForUser } from "../../controllers/impact/actions.js"
import { authenticateToken } from "../../middlewares/authenticateToken.js"

const actionsRouter = express.Router()

actionsRouter.route('/').get(authenticateToken, getActions).post(authenticateToken, addAction)
actionsRouter.route('/user').get(authenticateToken, getActionsForUser)
actionsRouter.route('/user/:id').get(authenticateToken, getActionsByUserId)
actionsRouter.route('/campaign/:id').get(authenticateToken, getActionsByCampaignId)
actionsRouter.route('/:id').get(authenticateToken, getActionById)

export default actionsRouter