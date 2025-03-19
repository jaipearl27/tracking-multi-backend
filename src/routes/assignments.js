import express from "express";
import { createAssignment, getAssignmentById, getAssignments, getAssignmentsByTrackingLinkId } from "../controllers/assignments.js";

const assignmentsRouter = express.Router();

assignmentsRouter.route('/').get(getAssignments).post(createAssignment);
assignmentsRouter.route('/:id').get(getAssignmentById)
assignmentsRouter.route('/trackingLink/:trackingLinkId').get(getAssignmentsByTrackingLinkId);

export default assignmentsRouter;
