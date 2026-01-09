import express from 'express';
import { createItem, getAllItems, getItemById, updateItem, deleteItem } from '../controllers/itemController';
import { upload } from '../middelware/multer';
import { authenticateUser } from '../middelware/auth';
import {authorizeRole} from "../middelware/authorizeRole"; // Auth middleware

const router = express.Router();

router.get('/', getAllItems);
router.get('/:id', getItemById);

router.post('/', authenticateUser,authorizeRole("ADMIN"), upload.single('image'), createItem);
router.put('/:id', authenticateUser, authorizeRole("ADMIN"), upload.single('image'), updateItem);
router.delete('/:id', authenticateUser, authorizeRole("ADMIN"), deleteItem);

export default router;