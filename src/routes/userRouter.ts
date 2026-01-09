import {Router} from "express";
import {
    deleteUser,
    getAllUser,
    getUser, googleLogin, handleRefreshToken,
    saveUser, updatePassword,
    updateUser,
    userLogin,
    userLogout
} from "../controllers/userController";
import {authenticateUser} from "../middelware/auth";
import {authorizeRole} from "../middelware/authorizeRole";

const router = Router()

router.post('/register', saveUser)
router.get('/get/:email',authenticateUser, getUser)
router.get('/get-all',authenticateUser, getAllUser)
router.put('/update/:email' ,authenticateUser, updateUser)
router.delete('/delete/:email', authenticateUser,authorizeRole("ADMIN"), deleteUser)
router.post('/login', userLogin)
router.post('/google-login', googleLogin)
router.post('/refreshToken', handleRefreshToken)
router.post('/logout',authenticateUser, userLogout)
router.post('/update-password', authenticateUser, updatePassword);

export default router;
