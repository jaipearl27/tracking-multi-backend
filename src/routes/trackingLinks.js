import express from 'express';
import {
    createTrackingLink,
    deleteTrackingLink,
    getAllTrackingLinks,
    getTrackingLink,
    updateTrackingLink
} from '../controllers/TrackingLinks.js';


const trackingLinksRouter = express.Router();

trackingLinksRouter.route('/').get(getAllTrackingLinks).post(createTrackingLink);
trackingLinksRouter.route('/:id').get(getTrackingLink).patch(updateTrackingLink).delete(deleteTrackingLink);

export default trackingLinksRouter;