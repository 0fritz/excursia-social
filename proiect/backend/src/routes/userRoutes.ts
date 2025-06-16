import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import {upload} from "../middleware/uploadsMiddleware";
import { uploadProfilePicture, uploadCoverImage, deleteUserImage, getUserImages, uploadGalleryImage, sendFriendRequest, respondToFriendRequest, getPendingFriendRequests, getUserProfiles, getFriends } from "../controllers/userControllers";
import { addUserTag, getUserProfile, removeUserTag, updateUserProfile, uploadPicture } from "../controllers/userControllers";
import { downloadImage } from "../controllers/userControllers";
import { getUserEvents } from "../controllers/eventsController";

const router = express.Router();

//User routes
router.get("/users/:id", getUserProfile);
router.get("/users", getUserProfiles);
router.put("/users/:id", authenticate, updateUserProfile);
router.post("/users/:id/tags", authenticate, addUserTag); 
router.delete("/users/:id/tags/:tag", authenticate, removeUserTag);
router.post("/users/:id/profile-picture", authenticate, upload.single("image"), uploadProfilePicture);
router.post("/users/:id/cover-image", authenticate, upload.single("image"), uploadCoverImage);
router.post("/upload-picture", authenticate, upload.single("image"), uploadPicture);


router.post("/users/:id/images", authenticate, upload.single("image"), uploadGalleryImage);
router.get("/users/:id/images", getUserImages);
router.delete("/images/:imageId", authenticate, deleteUserImage);
router.get("/users/:id/events", getUserEvents);

//FRIENDS

router.post('/friendships/request',authenticate, sendFriendRequest);
router.post('/friendships/respond',authenticate, respondToFriendRequest);
router.get('/friendships/pending', authenticate, getPendingFriendRequests);
router.get("/friendships/:id",authenticate, getFriends);



export default router;
