import mongoose from "mongoose";
import User from "../models/users.js";
import Assignments from "../models/assignments.js"
import { asyncHandler } from "../utils/errors/asyncHandler.js";
import Withdrawal from "../models/withdrawls.js";


const getUserId = async (req, res) => {
    let userId

    if (req?.user?.role && req?.user?.role !== "ADMIN") {
        if (mongoose.isValidObjectId(req?.user?._id)) {
            userId = req?.user?._id
        } else {
            return
        }
    }

    if (userId) {
        // Check if user exists & is a valid ObjectId
        if (mongoose.isValidObjectId(`${userId}`)) {
            const userExists = await User.findById(userId);
            if (!userExists) {
                return res.status(404).json({ success: false, message: "Invalid MongoDB ID." });
            }
        } else {
            return res.status(404).json({ success: false, message: "User not found." });
        }


    }

    return userId
}


export const getAssignmentMetrics = asyncHandler(async (req, res) => {

    const userId = await getUserId(req, res)

    let startDate = req?.query?.startDate ? new Date(req?.query?.startDate) : new Date();

    if (!req?.query?.startDate) {
        const monthsToSubtract = 1;
        startDate.setMonth(startDate.getMonth() - monthsToSubtract);
    }

    let endDate = req?.query?.endDate ? new Date(req?.query?.endDate) : new Date();

    // Set both dates to UTC boundaries
    startDate = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        0, 0, 0, 0
    ));

    endDate = new Date(Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate(),
        23, 59, 59, 999
    ));

    console.log(startDate, endDate)

    const pipeline = [
        {
            $match: {
                ...(userId ? { userId: new mongoose.Types.ObjectId(`${userId}`) } : {}),
                createdAt: { $gte: startDate },
                $expr: {
                    $or: [
                        { $eq: ["$inactiveDate", null] },
                        { $lte: ["$inactiveDate", endDate] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: {
                    createdDate: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    status: "$status"
                },
                totalAssignments: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0,
                createdAt: "$_id.createdDate",
                status: "$_id.status",
                totalAssignments: 1

            }
        }
    ]


    const data = await Assignments.aggregate(pipeline)
    console.log(data)
    return res.status(200).json({ message: "Assignment metrics found", data: data })


})

export const getWithdrawalMetrics = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide both a start date and an end date.' 
    });
  }

  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const metrics = await Withdrawal.aggregate([
      {
        $match: {
          approved: true, // Only count approved withdrawals
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      // Stage 2: Group documents by the creation date
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          // Calculate the total amount withdrawn for that day
          totalAmount: { $sum: '$amount' },
          // Count the number of withdrawals for that day
          count: { $sum: 1 },
        },
      },
      // Stage 3: Sort the results by date in ascending order
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: metrics.length, // Number of days with withdrawals
      data: metrics,
    });

  } catch (error) {
    console.error('Error fetching withdrawal metrics:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};