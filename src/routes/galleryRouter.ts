import {Router} from "express";
import {saveGalleryItem, getAllGalleryItems, updateGalleryItem, deleteGalleryItem, getGalleryItemById} from "../controllers/galleryController";
import {authenticateUser} from "../middelware/auth";
import {upload} from "../middelware/multer";
import {authorizeRole} from "../middelware/authorizeRole";

const router = Router()

router.post('/save',authenticateUser, authorizeRole("ADMIN"), upload.single('image'), saveGalleryItem);
router.get('/get-all', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.put('/update/:id',upload.single('image'), authorizeRole("ADMIN"), authenticateUser, updateGalleryItem);
router.delete('/delete/:id', deleteGalleryItem, authorizeRole("ADMIN"), authenticateUser);

export default router;
