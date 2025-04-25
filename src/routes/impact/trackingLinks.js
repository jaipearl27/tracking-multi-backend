import express from 'express';
import { createTrackingLink, deleteTrackingLink, getAllTrackingLinks, getTrackingLinkById, getTrackingLinkByProgramId, updateTrackingLink } from '../../controllers/impact/trackingLinks.js';
import { authenticateToken } from '../../middlewares/authenticateToken.js';


const trackingLinksRouter = express.Router();

trackingLinksRouter.route('/').get(authenticateToken, getAllTrackingLinks).post(authenticateToken, createTrackingLink);
trackingLinksRouter.route('/:id').get(authenticateToken, getTrackingLinkById).patch(authenticateToken, updateTrackingLink).delete(authenticateToken, deleteTrackingLink);
trackingLinksRouter.route('/program/:ProgramId').get(authenticateToken, getTrackingLinkByProgramId);

export default trackingLinksRouter;