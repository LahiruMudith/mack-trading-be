import express from 'express';
import { createPayment, notifyPayment } from '../controllers/paymentController';

const router = express.Router();

router.post('/create', createPayment);

router.post('/notify', express.urlencoded({ extended: true }), notifyPayment);

export default router;