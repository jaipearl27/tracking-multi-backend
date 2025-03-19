import mongoose from "mongoose";
import Assignments from "../models/assignments.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";

export const createAssignment = asyncHandler(async (req, res) => {
    let { trackingLinkId, userId } = req.body;

    if (!trackingLinkId || !userId) {
        return res.status(500).json({ message: "Tracking link ID and user ID are required" });
    }

    trackingLinkId = new mongoose.Types.ObjectId(`${trackingLinkId}`)
    userId = new mongoose.Types.ObjectId(`${userId}`)

    const assignmentExists = await Assignments.findOne({ trackingLinkId, userId });

    if (assignmentExists) {
        return res.status(500).json({ message: "Assignment already exists" });
    }

    const assignment = await Assignments.create({ trackingLinkId, userId });

    res.status(201).json(assignment);
});

export const getAssignments = asyncHandler(async (req, res) => {
    const assignments = await Assignments.find().populate('trackingLinkId userId');
    res.status(200).json(assignments);
});

export const getAssignmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(500).json({ message: "Assignment ID is required" });
    }
    const assignment = await Assignments.findById(id).populate('trackingLinkId userId');
    res.status(200).json(assignment);
});

export const getAssignmentsByTrackingLinkId = asyncHandler(async (req, res) => {
    const { trackingLinkId } = req.params;
    if (!trackingLinkId) {
        return res.status(500).json({ message: "Tracking link ID is required" });
    }
    // const assignments = await Assignments.find({ trackingLinkId: trackingLinkId }).populate('trackingLinkId userId');

    const assignments = await Assignments.aggregate(
        [
            {
                $match: {
                    trackingLinkId: new mongoose.Types.ObjectId(`${trackingLinkId}`)
                }
            },
            {
                $lookup: {
                    from: "TrackingLinks",
                    localField: "trackingLinkId",
                    foreignField: "_id",
                    as: "trackingLinkId"
                }
            },

            {
                $unwind: {
                    path: "$trackingLinkId",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            {
                $unwind: {
                    path: "$userId",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "ClickEvents",
                    localField: "trackingLinkId.ProgramId",
                    foreignField: "ProgramId",
                    as: "Clicks"
                }
            },
            {
                $addFields: {
                    totalClicks: { $size: "$Clicks" }
                }
            },
            {
                $project: {
                    Clicks: 0,
                    "userId.password": 0
                }
            }
        ]
    );

    res.status(200).json(assignments);
});