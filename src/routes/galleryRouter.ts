import {Router} from "express";
import {saveGalleryItem, getAllGalleryItems, updateGalleryItem, deleteGalleryItem, getGalleryItemById} from "../controllers/galleryController";
import {authenticateUser} from "../middelware/auth";
import {upload} from "../middelware/multer";

const router = Router()

router.post('/save',authenticateUser, upload.single('image'), saveGalleryItem);
router.get('/get-all', getAllGalleryItems);
router.get('/:id', getGalleryItemById);
router.put('/update/:id',upload.single('image'), authenticateUser, updateGalleryItem);
router.delete('/delete/:id', deleteGalleryItem, authenticateUser);

export default router;
