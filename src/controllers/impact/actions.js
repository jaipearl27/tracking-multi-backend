import mongoose from "mongoose";
import ActionModel from "../../models/impact/actions.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";

import chalk from "chalk"

export const addAction = asyncHandler(async (req, res, next) => {
    const data = await ActionModel.insertMany(req?.body)
    res.status(200).json({ data: data })
})

export const getActions = asyncHandler(async (req, res, next) => {

    console.log(req?.query)

    let {
        userId,
        minPayout, 
        maxPayout,
        minEventDate,
        maxEventDate,
        programName,
        programId,
        email,
        trackingLink,
        state,
    } = req?.query


    


    // console.log(chalk.red.bgWhite('userId', userId))

    if(req?.user?.role && req?.user?.role !== "ADMIN"){
        userId = req?.user?._id
    }


//    console.log(chalk.blue.bgWhite('userId', userId))
    

    const pipeline = [

        //date filter

        ...(minEventDate || maxEventDate ? [
            {
                $match: {
                    EventDate: {
                        ...(minEventDate ? { $gte: new Date(minEventDate) } : {}),
                        ...(maxEventDate ? { $lte: new Date(maxEventDate) } : {})
                    }
                }
            }
        ] : []),

        ...(programName ? [
            {
                $match: {
                    CampaignName: programName
                }
            }
        ] : []),

        ...(programId ? [
            {
                $match: {
                    CampaignId: programId
                }
            }
        ] : []),

        ...(state ? [
            {
                $match: {
                    State: state
                }
            }
        ] : []),


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

        ...(trackingLink ? [
            {
                $match: {
                  "TrackingLink.TrackingLink": trackingLink
                }
              },
        ] : []),


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

        ...(userId ? [{
            $match: {
                $expr: {
                    $eq: ["$Assignment.userId", new mongoose.Types.ObjectId(`${userId}`)]
                }
            }
        }]:[]),
    
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

        // assignedPayout filter

        ...(minPayout || maxPayout ? [
            {
                $match: {
                    assignedPayout: {
                        ...(minPayout ? { $gte: Number(minPayout) } : {}),
                        ...(maxPayout ? { $lte: Number(maxPayout) } : {})
                    }
                }
            }
        ] : []),

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
      

        //user filters
        
        ...(email ? [
            {
                $match: {
                  "user.email": email
                }
              },
        ] : []),


        {
            $facet: {
                documents: [
                {
                    $addFields: {
                    assignedPayout: {
                        $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                            $round: [
                            {
                                $multiply: [
                                { $toDouble: "$Payout" },
                                { $divide: ["$Assignment.commissionPercentage", 100] }
                                ]
                            },
                            2
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
                }
                ],
                summary: [
                {
                    $addFields: {
                    assignedPayout: {
                        $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                            $round: [
                            {
                                $multiply: [
                                { $toDouble: "$Payout" },
                                { $divide: ["$Assignment.commissionPercentage", 100] }
                                ]
                            },
                            2
                            ]
                        },
                        else: 0
                        },
                    },
                    trimmedState: {
                        $trim: { input: "$State" }
                    }
                    }
                },
                {
                    $group: {
                    _id: "$trimmedState",
                    totalAssignedPayout: { $sum: "$assignedPayout" }
                    }
                },
                {$sort: {_id: 1}},
                {
                    $project: {
                    _id: 0,
                    State: "$_id",
                    totalAssignedPayout: 1
                    }
                }
                ]
            }
        }

    ]

    // console.log(JSON.stringify(pipeline))

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
        // 

        {
            $facet: {
              documents: [
                {
                  $addFields: {
                    assignedPayout: {
                      $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                          $round: [
                            {
                              $multiply: [
                                { $toDouble: "$Payout" },
                                { $divide: ["$Assignment.commissionPercentage", 100] }
                              ]
                            },
                            2
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
                }
              ],
              summary: [
                {
                  $addFields: {
                    assignedPayout: {
                      $cond: {
                        if: { $ifNull: ["$Assignment.commissionPercentage", false] },
                        then: {
                          $round: [
                            {
                              $multiply: [
                                { $toDouble: "$Payout" },
                                { $divide: ["$Assignment.commissionPercentage", 100] }
                              ]
                            },
                            2
                          ]
                        },
                        else: 0
                      }
                    }
                  }
                },
                {
                  $group: {
                    _id: "$State",
                    totalAssignedPayout: { $sum: "$assignedPayout" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    State: "$_id",
                    totalAssignedPayout: 1
                  }
                }
              ]
            }
          }
    ]

    const data = await ActionModel.aggregate(pipeline)
    res.status(200).json({ data: data })
})
