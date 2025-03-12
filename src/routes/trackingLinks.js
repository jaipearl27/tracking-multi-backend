import express from 'express';
import {
    assignTrackingLink,
    deleteTrackingLink,
    getAllTrackingLinks,
    getTrackingLink,
    updateTrackingLink
} from '../controllers/TrackingLinks.js';


const trackingLinksRouter = express.Router();

trackingLinksRouter.route('/').get(getAllTrackingLinks).post(addTrackingLink);
trackingLinksRouter.route('/assign').post(assignTrackingLink);
trackingLinksRouter.route('/:id').get(getTrackingLink).patch(updateTrackingLink).delete(deleteTrackingLink);

export default trackingLinksRouter;