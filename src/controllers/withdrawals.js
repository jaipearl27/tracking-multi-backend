// controllers/withdrawalController.js

import ActionModel from "../models/impact/actions.js";
import ConversionModel from "../models/partnerize/conversions.js";
import User from "../models/users.js";
import Withdrawal from "../models/withdrawls.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js"; // Assuming your asyncHandler path
import mongoose from "mongoose";

// Create a new withdrawal request
export const createWithdrawal = asyncHandler(async (req, res, next) => {
    const { userId, amount, approved } = req.body;

    // Validate input
    if (!userId || !amount) {
        return res.status(400).json({ success: false, message: "User ID and Amount are required." });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be a positive number." });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    // Create new withdrawal
    const withdrawalPayload = {
        user: userId,
        amount,
    };

    // 'approved' is optional and defaults to true in the schema
    if (approved !== undefined && typeof approved === 'boolean') {
        withdrawalPayload.approved = approved;
    }

    const withdrawal = await Withdrawal.create(withdrawalPayload);

    res.status(201).json({ success: true, message: "Withdrawal request created successfully.", withdrawal });
});

// Get a single withdrawal by ID
export const getWithdrawalById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Withdrawal ID format." });
    }

    const withdrawal = await Withdrawal.findById(id).populate('user', 'name email'); // Populate user details

    if (!withdrawal) {
        return res.status(404).json({ success: false, message: "Withdrawal not found." });
    }

    res.status(200).json({ success: true, data: withdrawal });
});

// Get all withdrawals (with optional filtering by user or approval status)
export const getAllWithdrawals = asyncHandler(async (req, res, next) => {
    const { userId, approvedStatus } = req.query;
    const filter = {};

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid User ID format for filtering." });
        }
        filter.user = userId;
    }
    if (approvedStatus !== undefined) {
        filter.approved = approvedStatus === 'true' || approvedStatus === true;
    }

    const withdrawals = await Withdrawal.find(filter)
        .populate('user', 'name email role') // Populate user details, select specific fields
        .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ success: true, count: withdrawals.length, withdrawals });
});

// Update a withdrawal (e.g., to approve/reject, or change amount if business logic allows)
export const updateWithdrawal = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { amount, approved } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Withdrawal ID format." });
    }

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
        return res.status(404).json({ success: false, message: "Withdrawal not found." });
    }

    const updatePayload = {};
    if (amount !== undefined) {
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be a positive number." });
        }
        updatePayload.amount = amount;
    }
    if (approved !== undefined && typeof approved === 'boolean') {
        updatePayload.approved = approved;
    }

    if (Object.keys(updatePayload).length === 0) {
        return res.status(400).json({ success: false, message: "No valid fields provided for update." });
    }

    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updatePayload, {
        new: true, // Return the modified document rather than the original
        runValidators: true // Ensure schema validations are run on update
    }).populate('user', 'name email');

    res.status(200).json({ success: true, message: "Withdrawal updated successfully.", withdrawal: updatedWithdrawal });
});

// Delete a withdrawal
export const deleteWithdrawal = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Withdrawal ID format." });
    }

    const withdrawal = await Withdrawal.findByIdAndDelete(id);

    if (!withdrawal) {
        return res.status(404).json({ success: false, message: "Withdrawal not found." });
    }

    res.status(200).json({ success: true, message: "Withdrawal deleted successfully." });
    // Or use 204 No Content if you don't want to send a body
    // res.status(204).send();
});

// Get all withdrawals for a specific user
export const getWithdrawalsByUserId = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format." });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const withdrawals = await Withdrawal.find({ user: userId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: withdrawals.length, withdrawals });
});



// Get total for assigned payouts
export const getTotalPayouts = asyncHandler(async (req, res) => {
    let userId

    if (req?.user?.role && req?.user?.role !== "ADMIN") {
        if (mongoose.isValidObjectId(req?.user?._id)) {
            userId = req?.user?._id
        } else {
            return res.status(400).json({ success: false, message: "Invalid mongodb id." })
        }

    }

    // partnerize

    const partnerizePipeline = [
        {
            $lookup: {
                from: "Assignments",
                let: {
                    campaign_id: "$campaign_id",
                    conversion_time: "$conversion_time"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$campaign_id",
                                            "$$campaign_id"
                                        ]
                                    },
                                    {
                                        $lte: [
                                            "$createdAt",
                                            "$$conversion_time"
                                        ]
                                    },
                                    {
                                        $cond: {
                                            if: {
                                                $gte: [
                                                    "$inactiveDate",
                                                    "$$conversion_time"
                                                ]
                                            },
                                            then: true,
                                            else: {
                                                $eq: ["$inactiveDate", null]
                                            }
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
        }] : []),

        {
            $addFields: {
                assignedPayout: {
                    $cond: {
                        if: {
                            $ifNull: [
                                "$Assignment.commissionPercentage",
                                false
                            ]
                        },
                        then: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $toDouble:
                                                "$conversion_value.publisher_commission"
                                        },
                                        {
                                            $divide: [
                                                "$Assignment.commissionPercentage",
                                                100
                                            ]
                                        }
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
            $facet: {
                summary: [
                    {
                        $addFields: {
                            assignedPayout: {
                                $cond: {
                                    if: {
                                        $ifNull: [
                                            "$Assignment.commissionPercentage",
                                            false
                                        ]
                                    },
                                    then: {
                                        $round: [
                                            {
                                                $multiply: [
                                                    {
                                                        $toDouble:
                                                            "$conversion_value.publisher_commission"
                                                    },
                                                    {
                                                        $divide: [
                                                            "$Assignment.commissionPercentage",
                                                            100
                                                        ]
                                                    }
                                                ]
                                            },
                                            2
                                        ]
                                    },
                                    else: 0
                                }
                            },
                            trimmedState: {
                                $trim: {
                                    input:
                                        "$conversion_value.conversion_status"
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                currency: "$currency",
                                trimmedState: "$trimmedState"
                            },
                            totalAssignedPayout: {
                                $sum: "$assignedPayout"
                            },
                            ...(req?.user?.role === "ADMIN" ? { totalAdminPayout: { $sum: { $toDouble: "$conversion_value.publisher_commission" } } } : {})
                        }
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            State: "$_id",
                            totalAssignedPayout: 1,
                            ...(req?.user?.role === "ADMIN" ? { totalAdminPayout: 1 } : {})
                        }
                    }
                ]
            }
        }
    ]


    const partnerizePayouts = await ConversionModel.aggregate(partnerizePipeline)




    // impact

    const impactPipeline = [
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
                                    {
                                        $eq: [
                                            "$trackingLinkId",
                                            "$$trackingLinkId"
                                        ]
                                    },
                                    {
                                        $lte: [
                                            "$createdAt",
                                            "$$eventDate"
                                        ]
                                    },
                                    {
                                        $cond: {
                                            if: {
                                                $gte: [
                                                    "$inactiveDate",
                                                    "$$eventDate"
                                                ]
                                            },
                                            then: true,
                                            else: {
                                                $eq: ["$inactiveDate", null]
                                            }
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
        }] : []),
        {
            $addFields: {
                assignedPayout: {
                    $cond: {
                        if: {
                            $ifNull: [
                                "$Assignment.commissionPercentage",
                                false
                            ]
                        },
                        then: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $toDouble: "$Payout"
                                        },
                                        // No division by 100 — it's already in rupees
                                        {
                                            $divide: [
                                                "$Assignment.commissionPercentage",
                                                100
                                            ]
                                        }
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
            $facet: {
                summary: [
                    {
                        $addFields: {
                            assignedPayout: {
                                $cond: {
                                    if: {
                                        $ifNull: [
                                            "$Assignment.commissionPercentage",
                                            false
                                        ]
                                    },
                                    then: {
                                        $round: [
                                            {
                                                $multiply: [
                                                    {
                                                        $toDouble: "$Payout"
                                                    },
                                                    {
                                                        $divide: [
                                                            "$Assignment.commissionPercentage",
                                                            100
                                                        ]
                                                    }
                                                ]
                                            },
                                            2
                                        ]
                                    },
                                    else: 0
                                }
                            },
                            trimmedState: {
                                $trim: {
                                    input: "$State"
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                currency: "$Currency",
                                trimmedState: "$trimmedState"
                            },
                            totalAssignedPayout: {
                                $sum: "$assignedPayout"
                            },
                            ...(req?.user?.role === "ADMIN" ? { totalAdminPayout: { $sum: { $toDouble: "$Payout" } } } : {})
                        }
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            State: "$_id",
                            totalAssignedPayout: 1,
                            ...(req?.user?.role === "ADMIN" ? { totalAdminPayout: 1 } : {})
                        }
                    }
                ]
            }
        }
    ]

    const impactPayouts = await ActionModel.aggregate(impactPipeline)


    return res.status(200).json({ success: true, message: "Total Payouts Data Found.", partnerizePayouts, impactPayouts })

})
