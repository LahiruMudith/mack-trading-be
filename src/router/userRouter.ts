import {Router} from "express";
import {deleteUser, getUser, saveUser, updateUser} from "../controller/userController";
import {authenticateUser} from "../middelware/auth";

const router = Router()

router.post('/save', saveUser)
router.get('/get/:email', getUser)
router.put('/update', authenticateUser, updateUser)
router.delete('/delete', authenticateUser, deleteUser)

export default router;
