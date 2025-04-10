import mongoose from "mongoose";
import ActionModel from "../../models/impact/actions.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";

export const addAction = asyncHandler(async (req, res, next) => {
    const data = await ActionModel.insertMany(req?.body)
    res.status(200).json({ data: data })
})

export const getActions = asyncHandler(async (req, res, next) => {

    const pipeline = [
        {
            $lookup: {
                from: "TrackingLinks",
                localField: "CampaignId",
                foreignField: "ProgramId",
                as: "TrackingLink"
            }
        },
        {
            $unwind: {
                path: "$TrackingLink",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "Assignments",
                let: {
                    trackingLinkId: "$TrackingLink._id",
                    eventDate: "$EventDate"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$trackingLinkId", "$$trackingLinkId"] },
                                    { $lte: ["$createdAt", "$$eventDate"] },
                                    {
                                        $cond: {
                                            if: { $gte: ["$inactiveDate", "$$eventDate"] },
                                            then: true,
                                            else: { $eq: ["$inactiveDate", null] }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "Assignment"
            }
        },

        {
            $unwind: {
                path: "$Assignment",
                preserveNullAndEmptyArrays: true
            }
        },



        {
            $addFields: {
                assignedPayout: {
                    $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                            $round: [
                                {
                                    $multiply: [
                                        { $toDouble: "$Payout" }, // No division by 100 — it's already in rupees
                                        { $divide: ["$Assignment.commissionPercentage", 100] }
                                    ]
                                },
                                2 // Round to 2 decimal places
                            ]
                        },
                        else: 0
                    }
                }
            }
        },

        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "Assignment.userId",
                as: 'user'
            }
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },

    ]

    const data = await ActionModel.aggregate(pipeline)
    res.status(200).json({ data: data })
})

export const getActionById = asyncHandler(async (req, res, next) => {
    const { id } = req?.params

    if (!id) res.status(500).json({ message: 'No id provided' })

    const data = await ActionModel.findById(id)
    res.status(200).json({ data: data })
})


export const getActionsByCampaignId = asyncHandler(async (req, res, next) => {
    const { id } = req?.params

    if (!id) res.status(500).json({ message: 'No id provided' })

    const data = await ActionModel.find({ CampaignId: id })

    res.status(200).json({ data: data })
})


export const getActionsByUserId = asyncHandler(async (req, res, next) => {

    const { id } = req?.params

    if (!id) res.status(500).json({ message: 'No id provided' })

    // if(req?.user?.role === 'ADMIN')

    const pipeline = [
        {
            $lookup: {
                from: "TrackingLinks",
                localField: "CampaignId",
                foreignField: "ProgramId",
                as: "TrackingLink"
            }
        },
        {
            $unwind: {
                path: "$TrackingLink",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "Assignments",
                let: {
                    trackingLinkId: "$TrackingLink._id",
                    eventDate: "$EventDate"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$trackingLinkId", "$$trackingLinkId"] },
                                    { $lte: ["$createdAt", "$$eventDate"] },
                                    {
                                        $cond: {
                                            if: { $gte: ["$inactiveDate", "$$eventDate"] },
                                            then: true,
                                            else: { $eq: ["$inactiveDate", null] }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "Assignment"
            }
        },

        {
            $unwind: {
                path: "$Assignment",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $match: {
                $expr: {
                    $eq: ["$Assignment.userId", new mongoose.Types.ObjectId(`${id}`)]
                }
            }
        },


        {
            $addFields: {
                assignedPayout: {
                    $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                            $round: [
                                {
                                    $multiply: [
                                        { $toDouble: "$Payout" }, // No division by 100 — it's already in rupees
                                        { $divide: ["$Assignment.commissionPercentage", 100] }
                                    ]
                                },
                                2 // Round to 2 decimal places
                            ]
                        },
                        else: 0
                    }
                }
            }
        },

        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "Assignment.userId",
                as: 'user'
            }
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },

    ]

    const data = await ActionModel.aggregate(pipeline)
    res.status(200).json({ data: data })
})


export const getActionsForUser = asyncHandler(async (req, res, next) => {

    

    const pipeline = [
        {
            $lookup: {
                from: "TrackingLinks",
                localField: "CampaignId",
                foreignField: "ProgramId",
                as: "TrackingLink"
            }
        },
        {
            $unwind: {
                path: "$TrackingLink",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "Assignments",
                let: {
                    trackingLinkId: "$TrackingLink._id",
                    eventDate: "$EventDate"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$trackingLinkId", "$$trackingLinkId"] },
                                    { $lte: ["$createdAt", "$$eventDate"] },
                                    {
                                        $cond: {
                                            if: { $gte: ["$inactiveDate", "$$eventDate"] },
                                            then: true,
                                            else: { $eq: ["$inactiveDate", null] }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "Assignment"
            }
        },

        {
            $unwind: {
                path: "$Assignment",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $match: {
                $expr: {
                    $eq: ["$Assignment.userId", new mongoose.Types.ObjectId(`${req?.user?._id}`)]
                }
            }
        },


        {
            $addFields: {
                assignedPayout: {
                    $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                            $round: [
                                {
                                    $multiply: [
                                        { $toDouble: "$Payout" }, // No division by 100 — it's already in rupees
                                        { $divide: ["$Assignment.commissionPercentage", 100] }
                                    ]
                                },
                                2 // Round to 2 decimal places
                            ]
                        },
                        else: 0
                    }
                }
            }
        },

        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "Assignment.userId",
                as: 'user'
            }
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },

    ]

    const data = await ActionModel.aggregate(pipeline)
    res.status(200).json({ data: data })
})
