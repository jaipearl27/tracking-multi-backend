import mongoose from "mongoose";

import { asyncHandler } from "../utils/errors/asyncHandler.js";
import Assignments from "../models/assignments.js";

export const createAssignment = asyncHandler(async (req, res) => {
    console.log('bitch')
    let { trackingLinkId, campaign_id, userId, commissionPercentage, platform } = req.body;

    if (!userId || !commissionPercentage || !platform) {
        return res.status(500).json({ message: "User ID, commission percentage & Platform is required" });
    }

    if (platform === 'impact' && !trackingLinkId) {
        return res.status(500).json({ message: "Tracking Link ID is required" })
    }

    if (platform === 'platform' && !campaign_id) {
        return res.status(500).json({ message: "Campaign ID is required" })
    }


    if (trackingLinkId) {
        trackingLinkId = new mongoose.Types.ObjectId(`${trackingLinkId}`)
    }

    userId = new mongoose.Types.ObjectId(`${userId}`)

    const assignmentExists = await Assignments.findOne({ ...(platform === 'impact' ? { trackingLinkId: trackingLinkId } : { campaign_id: campaign_id }), status: "active" });
    console.log(assignmentExists)

    if (assignmentExists) {
        if (String(assignmentExists.userId) == String(userId) && assignmentExists.status === 'active') {
            return res.status(500).json({ message: "Assignment already exists" });
        }

        if (String(assignmentExists.userId) != String(userId) && assignmentExists.status === 'active') {
            assignmentExists.status = "inactive"
            assignmentExists.inactiveDate = Date.now()
            await assignmentExists.save()
        }
    }

    const assignment = await Assignments.create({
        ...(platform === 'impact' ? { trackingLinkId: trackingLinkId } : { campaign_id: campaign_id }),
        userId,
        commissionPercentage,
        platform
    });

    // console.log(assignment, 'tetetetetttetittitestiitestitsteddies')

    return res.status(200).json({ assignment, message: 'Assignment made successfully!' });
});

export const getAssignments = asyncHandler(async (req, res) => {
    const { status } = req?.query
    const assignments = await Assignments.find({ ...(status ? { status: status } : { status: "active" }) }).populate('trackingLinkId userId');
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


export const getAssignmentByCampaignId = asyncHandler(async (req, res) => {
    const { campaign_id } = req.params

    if (!campaign_id) return res.status(500).json({ message: "campaign_id is required" })

    const pipeline = [
        {
            $match: {
                campaign_id: campaign_id,
                status: "active"
            }
        },
        {
            $lookup: {
                from: "PartnerizeTrackingLinks",
                localField: "campaign_id",
                foreignField: "campaign_id",
                as: "trackingLinks"
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
                from: "PartnerizeClickEvents",
                localField: "campaign_id",
                foreignField: "campaign_id",
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
                                {
                                    $toDate: "$$click.set_time"
                                },
                                // Ensure EventDate is a Date
                                "$createdAt" // createdAt is already a Date
                            ]
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                totalClicks: {
                    $size: "$Clicks"
                }
            }
        },
        {
            $project: {
                Clicks: 0,
                "userId.password": 0
            }
        }
    ]

    const assignments = await Assignments.aggregate(pipeline)
    return res.status(200).json(assignments)
})


export const getUserAssignments = asyncHandler(async (req, res) => {

    let id = req?.user?._id

    if (req?.query?.id) id = req?.query?.id

    if (!id) return res.status(500).message({ status: "User ID is required." })


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
                from: "PartnerizeTrackingLinks",
                localField: "campaign_id",
                foreignField: "campaign_id",
                as: "partnerizeTrackingLinks"
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

        // impact clicks
        {
            $lookup: {
                from: "ClickEvents",
                localField: "trackingLinkId.ProgramId",
                foreignField: "ProgramId",
                as: "impactClicks"
            }
        },

        // partnerize clicks
        {
            $lookup: {
                from: "PartnerizeClickEvents",
                localField: "campaign_id",
                foreignField: "campaign_id",
                as: "partnerizeClicks"
            }
        },

        {
            $addFields: {
                Clicks: {
                    $cond: [
                        { $eq: ["$platform", "impact"] },
                        {
                            $filter: {
                                input: "$impactClicks",
                                as: "click",
                                cond: {
                                    $and: [
                                        {
                                            $gte: [
                                                {
                                                    $toDate:
                                                        "$$click.EventDate"
                                                },
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
                                                        {
                                                            $eq: [
                                                                "$status",
                                                                "inactive"
                                                            ]
                                                        },
                                                        {
                                                            $lte: [
                                                                {
                                                                    $toDate:
                                                                        "$$click.EventDate"
                                                                },
                                                                "$inactiveDate"
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $filter: {
                                input: "$partnerizeClicks",
                                as: "click",
                                cond: {
                                    $and: [
                                        {
                                            $gte: [
                                                {
                                                    $toDate:
                                                        "$$click.set_time"
                                                },
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
                                                        {
                                                            $eq: [
                                                                "$status",
                                                                "inactive"
                                                            ]
                                                        },
                                                        {
                                                            $lte: [
                                                                {
                                                                    $toDate:
                                                                        "$$click.set_time"
                                                                },
                                                                "$inactiveDate"
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
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
                impactClicks: 0,
                partnerizeClicks: 0,
                "userId.password": 0
            }
        },

        {
            $group: {
                _id: "$platform",
                records: { $push: "$$ROOT" },
                totalPlatformClicks: { $sum: "$totalClicks" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ];

    const assignments = await Assignments.aggregate(
        pipeline
    );

    res.status(200).json(assignments);
});

// export const getAssignmentsByUserId = asyncHandler(async (req, res) => {
//     const { id } = req?.params

//     if (!id) res.status(400).json({ status: false, message: "User Id not provided." })

//     const pipeline = [
//         {
//             $match: {
//                 userId: new mongoose.Types.ObjectId(`${id}`),
//             }
//         },
//         {
//             $lookup: {
//                 from: "TrackingLinks",
//                 localField: "trackingLinkId",
//                 foreignField: "_id",
//                 as: "trackingLinkId"
//             }
//         },
//         {
//             $unwind: {
//                 path: "$trackingLinkId",
//                 preserveNullAndEmptyArrays: true
//             }
//         },


//         {
//             $lookup: {
//                 from: "users",
//                 localField: "userId",
//                 foreignField: "_id",
//                 as: "userId"
//             }
//         },
//         {
//             $unwind: {
//                 path: "$userId",
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $lookup: {
//                 from: "ClickEvents",
//                 localField: "trackingLinkId.ProgramId",
//                 foreignField: "ProgramId",
//                 as: "Clicks"
//             }
//         },
//         {
//             $addFields: {
//                 Clicks: {
//                     $filter: {
//                         input: "$Clicks",
//                         as: "click",
//                         cond: {
//                             $and: [
//                                 {
//                                     $gte: [
//                                         { $toDate: "$$click.EventDate" },
//                                         "$createdAt"
//                                     ]
//                                 },
//                                 {
//                                     $or: [
//                                         {
//                                             $eq: ["$status", "active"]
//                                         },
//                                         {
//                                             $and: [
//                                                 { $eq: ["$status", "inactive"] },
//                                                 { $lte: [{ $toDate: "$$click.EventDate" }, "$inactiveDate"] }
//                                             ]
//                                         }
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             }
//         },
//         {
//             $addFields: {
//                 totalClicks: { $size: "$Clicks" }
//             }
//         },

//         {
//             $project: {
//                 Clicks: 0,
//                 "userId.password": 0
//             }
//         }
//     ];

//     const assignments = await Assignments.aggregate(
//         pipeline
//     );

//     res.status(200).json(assignments);
// });