import TrackingLinks from "../models/trackingLinks.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";

export const createTrackingLink = asyncHandler(async (req, res, next) => {
    const { trackingLink, programId } = req.body;

    if (!trackingLink || !programId) {
        return res.status(400).json({ success: false, message: "Tracking link and programId are required" });
    }


    const trackingLinkExists = await TrackingLinks.findOne({ trackingLink: trackingLink });
    if (trackingLinkExists) {
        return res.status(400).json({ success: false, message: "Tracking link already exists" });
    }

    const tracking = await TrackingLinks.create({ trackingLink, programId });

    res.status(201).json({ success: true, message: "Tracking link added successfully", tracking });
});

export const getTrackingLink = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const tracking = await TrackingLinks.findById(id);

    if (!tracking) {
        return res.status(404).json({ success: false, message: "Tracking link not found" });
    }

    res.status(200).json({ success: true, tracking });
});


// export const getTrackingLinkByProgramId = asyncHandler(async (req, res, next) => {
//     const { programId } = req.params;
//     const tracking = await TrackingLinks.find({ programId });
//     res.status(200).json({ success: true, tracking });
// });

export const getAllTrackingLinks = asyncHandler(async (req, res, next) => {
    const trackingLinks = await TrackingLinks.find();
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
    res.status(200).json({ success: true, message: "Tracking link deleted successfully" });
});
