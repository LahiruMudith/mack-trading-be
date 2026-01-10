import express from 'express';
import {createOrder, getUserOrders, notifyPayment} from '../controllers/orderController';
import { authenticateUser } from '../middelware/auth';

const router = express.Router();

// User Routes
router.post('/place', authenticateUser, createOrder);
router.post('/notify', authenticateUser, notifyPayment);
router.get('/get-all', authenticateUser, getUserOrders); // <--- New Route
// router.get('/my-orders', authenticateUser, getMyOrders);
//
// router.get('/all', authenticateUser, getAllOrders);
// router.put('/status/:id', authenticateUser, updateOrderStatus);

export default router;