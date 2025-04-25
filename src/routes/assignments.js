import express from "express";
// import { createAssignment, getAssignmentById, getAssignments, getAssignmentsByTrackingLinkId, getAssignmentsByUserId, getUserAssignments } from "../../controllers/assignments.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { createAssignment, getAssignmentByCampaignId, getAssignmentById, getAssignments, getAssignmentsByTrackingLinkId, getUserAssignments } from "../controllers/assignments.js";

const assignmentsRouter = express.Router();

assignmentsRouter.route('/').get(authenticateToken, getAssignments).post(authenticateToken, createAssignment);
assignmentsRouter.route('/user').get(authenticateToken, getUserAssignments)
// assignmentsRouter.route('/user/:id').get(authenticateToken, getAssignmentsByUserId)
assignmentsRouter.route('/:id').get(authenticateToken, getAssignmentById)
assignmentsRouter.route('/trackingLink/:trackingLinkId').get(authenticateToken, getAssignmentsByTrackingLinkId);
assignmentsRouter.route('/campaign/:campaign_id').get(authenticateToken, getAssignmentByCampaignId)

export default assignmentsRouter;
