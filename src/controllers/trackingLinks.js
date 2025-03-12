import mongoose from "mongoose";
import TrackingLinks from "../models/trackingLinks.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";


export const addTrackingLink = asyncHandler(async (req, res, next) => {
    const { trackingLink, campaignId } = req.body;

    if (!trackingLink) {
        return res.status(400).json({ success: false, message: "Tracking link is required" });
    }

    const tracking = await TrackingLinks.create({ trackingLink, campaignId });

    res.status(201).json({ success: true, message: "Tracking link added successfully", tracking });
});


export const assignTrackingLink = asyncHandler(async (req, res, next) => {
    const { trackingLink, user } = req.body;
    
    if (!trackingLink || !user) {
        return res.status(400).json({ success: false, message: "Tracking link and user ID are required" });
    }


    const assignmentExists = await TrackingLinks.findOne({ trackingLink: trackingLink });
    if (assignmentExists) {
        return res.status(400).json({ success: false, message: "Tracking link already assigned" });
    }

    const tracking = await TrackingLinks.create({ trackingLink, user: new mongoose.Types.ObjectId(`${user}`) });

    res.status(201).json({ success: true, message: "Tracking link assigned successfully", tracking });
});

export const getTrackingLink = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const tracking = await TrackingLinks.findById(id).populate("user", "name email");
    
    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }

    res.status(200).json({ success: true, tracking });
});

export const getAllTrackingLinks = asyncHandler(async (req, res, next) => {
    const trackingLinks = await TrackingLinks.find().populate("user", "name email");
    res.status(200).json({ success: true, trackingLinks });
});

export const updateTrackingLink = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const tracking = await TrackingLinks.findById(id);
    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }
    
    const updatedTracking = await TrackingLinks.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, tracking: updatedTracking });
});

export const deleteTrackingLink = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const tracking = await TrackingLinks.findById(id);
    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }
    
    await TrackingLinks.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Tracking link assignment deleted successfully" });
});
