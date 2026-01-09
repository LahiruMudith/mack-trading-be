import express from 'express';
import {addToCart, getCart, removeCartItem, updateCartItem} from '../controllers/cartController';
import {authenticateUser} from "../middelware/auth";

const router = express.Router();

router.post('/add', authenticateUser, addToCart);

router.get('/', authenticateUser, getCart);
router.delete('/:itemId', authenticateUser, removeCartItem);
router.put('/:itemId', authenticateUser, updateCartItem);

export default router;