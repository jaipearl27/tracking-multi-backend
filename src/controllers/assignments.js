import mongoose from "mongoose";
import Assignments from "../models/assignments";
import { asyncHandler } from "../utils/errors/asyncHandler";

export const createAssignment = asyncHandler(async (req, res) => {
    let { trackingLinkId, userId } = req.body;

    if (!trackingLinkId || !userId) {
        return res.status(400).json({ message: "Tracking link ID and user ID are required" });
    }

    trackingLinkId = new mongoose.Types.ObjectId(`${trackingLinkId}`)
    userId = new mongoose.Types.ObjectId(`${userId}`)

    const assignmentExists = await Assignments.findOne({ trackingLinkId, userId });

    if (assignmentExists) {
        return res.status(400).json({ message: "Assignment already exists" });
    }

    const assignment = await Assignments.create({ trackingLinkId, userId });

    res.status(201).json(assignment);
});

export const getAssignments = asyncHandler(async (req, res) => {
    const assignments = await Assignments.find();
    res.status(200).json(assignments);
});


export const getAssignmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Assignment ID is required" });
    }
    const assignment = await Assignments.findById(id);
    res.status(200).json(assignment);
});

export const getAssignmentsByTrackingLinkId = asyncHandler(async (req, res) => {
    const { trackingLinkId } = req.params;
    if (!trackingLinkId) {
        return res.status(400).json({ message: "Tracking link ID is required" });
    }
    const assignments = await Assignments.find({ trackingLinkId: trackingLinkId });
    res.status(200).json(assignments);
});







