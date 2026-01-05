import express from 'express';
import {checkoutAndPay, notifyPayment} from '../controllers/orderController';
import { authenticateUser } from '../middelware/auth';

const router = express.Router();

// User Routes
router.post('/place', authenticateUser, checkoutAndPay);
router.post('/notify', authenticateUser, notifyPayment);
// router.get('/my-orders', authenticateUser, getMyOrders);
//
// router.get('/all', authenticateUser, getAllOrders);
// router.put('/status/:id', authenticateUser, updateOrderStatus);

export default router;