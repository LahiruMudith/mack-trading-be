import express from 'express';
import { createItem, getAllItems, getItemById, updateItem, deleteItem } from '../controllers/itemController';
import { upload } from '../middelware/multer';
import { authenticateUser } from '../middelware/auth'; // Auth middleware

const router = express.Router();

router.get('/', getAllItems);
router.get('/:id', getItemById);

router.post('/', authenticateUser, upload.single('image'), createItem);
router.put('/:id', authenticateUser, upload.single('image'), updateItem);
router.delete('/:id', authenticateUser, deleteItem);

export default router;