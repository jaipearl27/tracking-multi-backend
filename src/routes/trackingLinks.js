import express from 'express';
import {
    createTrackingLink,
    deleteTrackingLink,
    getAllTrackingLinks,
    getTrackingLinkById,
    getTrackingLinkByProgramId,
    updateTrackingLink
} from '../controllers/trackingLinks.js';

const trackingLinksRouter = express.Router();

trackingLinksRouter.route('/').get(getAllTrackingLinks).post(createTrackingLink);
trackingLinksRouter.route('/:id').get(getTrackingLinkById).patch(updateTrackingLink).delete(deleteTrackingLink);
trackingLinksRouter.route('/program/:ProgramId').get(getTrackingLinkByProgramId);

export default trackingLinksRouter;