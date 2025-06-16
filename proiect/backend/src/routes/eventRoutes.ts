import express from 'express';
import { getPublicEvents, createEvent, markInterested, unmarkInterested, checkInterested, getEventCardData, getEventById, applyToEvent, getPendingApplications, respondToEventApplication, getEventsHandler, getComments, postComment } from '../controllers/eventsController';
import { authenticate } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadsMiddleware';
import { GPTreq } from '../controllers/gptController';

const router = express.Router();

router.get('/events', getEventsHandler);
// router.get('/events/:id', getEventById);
router.post('/events', authenticate, upload.single('image'), createEvent);
router.get('/events/:id',authenticate, getEventById);

//interested routes
router.post('/events/:id/interested', authenticate, markInterested);
router.delete('/events/:id/interested', authenticate, unmarkInterested);
router.get('/events/:id/interested', authenticate, checkInterested);

router.post('/events/applications/apply', authenticate, applyToEvent);
router.post('/events/applications/respond', authenticate, respondToEventApplication);
router.get('/events/applications/pending', authenticate, getPendingApplications);

router.get('/gpt', authenticate, GPTreq);

router.post('/events/:eventId/comments', authenticate, postComment);
router.get('/events/:eventId/comments', authenticate, getComments);



export default router;
