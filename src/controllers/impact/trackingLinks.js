import TrackingLinks from "../../models/impact/trackingLinks.js";
import { asyncHandler } from "../../utils/errors/asyncHandler.js";

export const createTrackingLink = asyncHandler(async (req, res, next) => {
    const { TrackingLink, ProgramId, platform } = req.body;
    
    if (!TrackingLink || !ProgramId || !platform) {
        return res.status(400).json({ success: false, message: "Tracking link, programId & platform are required" });
    }

    const trackingLinkExists = await TrackingLinks.findOne({ TrackingLink });

    if (trackingLinkExists) {
        return res.status(400).json({ success: false, message: "Tracking link already exists" });
    }

    const tracking = await TrackingLinks.create({ TrackingLink, ProgramId, platform });

    res.status(201).json({ success: true, message: "Tracking link added successfully", tracking });
});

export const getTrackingLinkByProgramId = asyncHandler(async (req, res, next) => {
    const { ProgramId } = req.params;

    if (!ProgramId) {
        return res.status(400).json({ success: false, message: "ProgramId is required" });
    }

    const trackingLinks = await TrackingLinks.find({ ProgramId: ProgramId });

    if (!trackingLinks) {
        return res.status(404).json({ success: false, message: "Tracking link not found for this program" });
    }

    res.status(200).json({ success: true, trackingLinks });
});


export const getTrackingLinkById = asyncHandler(async (req, res, next) => {
    const { Id } = req.params;

    if (!Id) {
        return res.status(400).json({ success: false, message: "Id is required" });
    }

    const tracking = await TrackingLinks.findById(Id);

    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }

    res.status(200).json({ success: true, tracking });
})

export const getAllTrackingLinks = asyncHandler(async (req, res, next) => {
    const trackingLinks = await TrackingLinks.find();
    res.status(200).json({ success: true, trackingLinks });
});

export const updateTrackingLink = asyncHandler(async (req, res, next) => {
    const { Id } = req.params;

    const tracking = await TrackingLinks.findById(Id);
    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }

    const updatedTracking = await TrackingLinks.findByIdAndUpdate(Id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, tracking: updatedTracking });
});

export const deleteTrackingLink = asyncHandler(async (req, res, next) => {
    const { Id } = req.params;

    const tracking = await TrackingLinks.findById(Id);
    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }

    await TrackingLinks.findByIdAndDelete(Id);
    res.status(200).json({ success: true, message: "Tracking link deleted successfully" });
});
