import mongoose from "mongoose";
import Assignments from "../../models/impact/assignments.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";

export const createAssignment = asyncHandler(async (req, res) => {
    let { trackingLinkId, userId, commissionPercentage, platform } = req.body;

    if (!trackingLinkId || !userId || !commissionPercentage || !platform) {
        return res.status(500).json({ message: "Tracking link ID, user ID & commission percentage is required" });
    }

    trackingLinkId = new mongoose.Types.ObjectId(`${trackingLinkId}`)
    userId = new mongoose.Types.ObjectId(`${userId}`)

    const assignmentExists = await Assignments.findOne({ trackingLinkId, status: "active" });
    // console.log(assignmentExists)
    // console.log(String(assignmentExists.userId) , String(userId))

    if (assignmentExists) {
        if (String(assignmentExists.userId) == String(userId) && assignmentExists.status === 'active') {
            return res.status(500).json({ message: "Assignment already exists" });
        }

        if (String(assignmentExists.userId) != String(userId) && assignmentExists.status === 'active') {
            assignmentExists.status = "inactive"
            assignmentExists.inactiveDate = Date.now()
            await assignmentExists.save()
            // console.log(oldAssignment, 'old assignment')
        }
    }



    const assignment = await Assignments.create({ trackingLinkId, userId, commissionPercentage, platform });

    res.status(201).json(assignment);
});

export const getAssignments = asyncHandler(async (req, res) => {
    const assignments = await Assignments.find({ status: "active" }).populate('trackingLinkId userId');
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

// uses same/similar aggregation pipelines:

export const getAssignmentsByTrackingLinkId = asyncHandler(async (req, res) => {
    const { trackingLinkId } = req.params;
    if (!trackingLinkId) {
        return res.status(500).json({ message: "Tracking link ID is required" });
    }
    // const assignments = await Assignments.find({ trackingLinkId: trackingLinkId }).populate('trackingLinkId userId');

    const pipeline = [
        {
            $match: {
                trackingLinkId: new mongoose.Types.ObjectId(`${trackingLinkId}`),
                status: "active"
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
                from: "Actions",
                localField: "trackingLinkId.ProgramId",
                foreignField: "CampaignId",
                as: "conversions"
            }
        },
        {
            $unwind: {
                path: "$Actions",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields: {
                totalPayout: {
                    $sum: {
                        $map: {
                            input: "$conversions",
                            as: "conversion",
                            in: { $toDouble: "$$conversion.Payout" }
                        }
                    }
                }
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
                Clicks: {
                    $filter: {
                        input: "$Clicks",
                        as: "click",
                        cond: {
                            $gte: [
                                { $toDate: "$$click.EventDate" }, // Ensure EventDate is a Date
                                "$createdAt" // createdAt is already a Date
                            ]
                        }
                    }
                }
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
    ];


    const assignments = await Assignments.aggregate(
        pipeline
    );

    res.status(200).json(assignments);
});

export const getUserAssignments = asyncHandler(async (req, res) => {
    // console.log("req?.user", req?.user)

    // const assignments = await Assignments.find({ trackingLinkId: trackingLinkId }).populate('trackingLinkId userId');

    const pipeline = [
        {
            $match: {
                userId: new mongoose.Types.ObjectId(`${req?.user?._id}`),
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
                from: "Actions",
                localField: "trackingLinkId.ProgramId",
                foreignField: "CampaignId",
                as: "conversions"
            }
        },
        {
            $unwind: {
                path: "$Actions",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields: {
                totalPayout: {
                    $sum: {
                        $map: {
                            input: "$conversions",
                            as: "conversion",
                            in: { $toDouble: "$$conversion.Payout" }
                        }
                    }
                }
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
                Clicks: {
                    $filter: {
                        input: "$Clicks",
                        as: "click",
                        cond: {
                            $and: [
                                {
                                    $gte: [
                                        { $toDate: "$$click.EventDate" },
                                        "$createdAt"
                                    ]
                                },
                                {
                                    $or: [
                                        {
                                            $eq: ["$status", "active"]
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$status", "inactive"] },
                                                { $lte: [{ $toDate: "$$click.EventDate" }, "$inactiveDate"] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
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
    ];

    // console.log(`pipeline==================================`, pipeline)


    const assignments = await Assignments.aggregate(
        pipeline
    );

    res.status(200).json(assignments);
});

export const getAssignmentsByUserId = asyncHandler(async (req, res) => {
    const { id } = req?.params

    if (!id) res.status(400).json({ status: false, message: "User Id not provided." })

    const pipeline = [
        {
            $match: {
                userId: new mongoose.Types.ObjectId(`${id}`),
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
                from: "Actions",
                localField: "trackingLinkId.ProgramId",
                foreignField: "CampaignId",
                as: "conversions"
            }
        },
        {
            $unwind: {
                path: "$Actions",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $addFields: {
                totalPayout: {
                    $sum: {
                        $map: {
                            input: "$conversions",
                            as: "conversion",
                            in: { $toDouble: "$$conversion.Payout" }
                        }
                    }
                }
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
                Clicks: {
                    $filter: {
                        input: "$Clicks",
                        as: "click",
                        cond: {
                            $and: [
                                {
                                    $gte: [
                                        { $toDate: "$$click.EventDate" },
                                        "$createdAt"
                                    ]
                                },
                                {
                                    $or: [
                                        {
                                            $eq: ["$status", "active"]
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$status", "inactive"] },
                                                { $lte: [{ $toDate: "$$click.EventDate" }, "$inactiveDate"] }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
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
    ];


    // console.log(`pipeline==================================`, pipeline)


    const assignments = await Assignments.aggregate(
        pipeline
    );

    res.status(200).json(assignments);
});




// uses same/similar aggregation pipelines ends