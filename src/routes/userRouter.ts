import {Router} from "express";
import {
    deleteUser,
    getAllUser,
    getUser,
    saveUser,
    updateUser,
    userLogin,
    userLogout
} from "../controllers/userController";
import {authenticateUser} from "../middelware/auth";

const router = Router()

router.post('/register', saveUser)
router.get('/get/:email',authenticateUser, getUser)
router.get('/get-all',authenticateUser, getAllUser)
router.put('/update/:email' ,authenticateUser, updateUser)
router.delete('/delete/:email', authenticateUser, deleteUser)
router.get('/login', userLogin)
router.get('/logout',authenticateUser, userLogout)

export default router;
