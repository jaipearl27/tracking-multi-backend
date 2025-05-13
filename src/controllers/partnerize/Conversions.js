import mongoose from "mongoose";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";
import chalk from "chalk"
import ConversionModel from "../../models/partnerize/conversions.js";

export const addConversion = asyncHandler(async (req, res, next) => {

  const data = req?.body

  if (!Array.isArray(data)) return res.status(500).json({ message: 'data is not in correct Array format' })

  if (data?.length <= 0) return res.status(500).json({ message: "Data is empty" })

  const formattedData = data?.map((item) => {
    if (item?.conversion_data) {
      // Ensure set_time is stored as a Date
      if (item.conversion_data?.conversion_time && typeof item.conversion_data?.conversion_time === "string") {
        const splitDateTime = item.conversion_data?.conversion_time.split(" ")
        item.conversion_data.conversion_time = new Date(`${splitDateTime[0]}T${splitDateTime[1]}Z`) //Ensuring that UTC string '2025-04-25 05:56:31' stays in UTC format
      }

      return {
        updateOne: {
          filter: item.conversion_data,
          update: { $set: item.conversion_data },
          upsert: true
        }
      }
    }
  });

  const result = await ConversionModel.bulkWrite(formattedData)
  res.status(200).json({ data: result })
})

export const getConversions = asyncHandler(async (req, res, next) => {

  console.log(req?.query)

  let {
    userId,
    minPayout,
    maxPayout,
    minEventDate,
    maxEventDate,
    campaign_title,
    campaign_id,
    email,
    conversion_status,
  } = req?.query


  // console.log(chalk.red.bgWhite('userId', userId))

  if (req?.user?.role && req?.user?.role !== "ADMIN") {
    userId = req?.user?._id
  }

  console.log(chalk.bgWhite('Partnerize conversion USER ID: ', userId))

  // converting minEventDate to start of the day time 
  minEventDate = new Date(minEventDate).setHours(0, 0, 0, 0)

  // converting maxEventDate to end of day time
  maxEventDate = new Date(maxEventDate).setHours(23, 59, 59, 999)

  
  const pipeline = [

    //date filter

    ...(minEventDate || maxEventDate ? [
      {
        $match: {
          conversion_time: {
            ...(minEventDate ? { $gte: new Date(minEventDate) } : {}),
            ...(maxEventDate ? { $lte: new Date(maxEventDate) } : {})
          }
        }
      }
    ] : []),

    ...(campaign_title ? [
      {
        $match: {
          campaign_title: campaign_title
        }
      }
    ] : []),

    ...(campaign_id ? [
      {
        $match: {
          campaign_id: campaign_id
        }
      }
    ] : []),

    ...(conversion_status ? [
      {
        $match: {
          "conversion_value.conversion_status": conversion_status
        }
      }
    ] : []),

    {
      $lookup: {
        from: "PartnerizeTrackingLinks",
        localField: "campaign_id",
        foreignField: "campaign_id",
        as: "TrackingLinks"
      }
    },

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
        as: "user"
      }
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true
      }
    },


    //     //user filters

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
              }
            }
          },
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "Assignment.userId",
              as: "user"
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
              }
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
              totalAssignedPayout: 1
            }
          }
        ]
      }
    }
  ]


  const data = await ConversionModel.aggregate(pipeline)
  res.status(200).json({ data: data })
})

export const getConversionById = asyncHandler(async (req, res, next) => {
  const { id } = req?.params

  if (!id) res.status(500).json({ message: 'No id provided' })

  const data = await ConversionModel.findById(id)
  res.status(200).json({ data: data })
})


export const getConversionsByCampaignId = asyncHandler(async (req, res, next) => {
  const { id } = req?.params

  if (!id) res.status(500).json({ message: 'No id provided' })

  const data = await ConversionModel.find({ CampaignId: id })

  res.status(200).json({ data: data })
})


