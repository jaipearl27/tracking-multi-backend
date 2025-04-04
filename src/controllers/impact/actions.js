import ActionModel from "../../models/impact/actions.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";

export const addAction = asyncHandler(async (req, res, next) => {
    const data = await ActionModel.insertMany(req?.body)
    res.status(200).json({ data: data })
})

export const getActions = asyncHandler(async (req, res, next) => {
    const data = await ActionModel.find({})
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
