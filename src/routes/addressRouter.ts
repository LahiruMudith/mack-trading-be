import express from 'express';
import {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
} from '../controllers/addressController';
import {authenticateUser} from "../middelware/auth";

const router = express.Router();

router.post('/add',authenticateUser, createAddress);
router.get('/get-all',authenticateUser, getUserAddresses);
router.get('/:id',authenticateUser, getAddressById);
router.put('/:id',authenticateUser, updateAddress);
router.delete('/:id',authenticateUser, deleteAddress);

export default router;