import {Router} from "express";
import {deleteUser, getAllUser, getUser, saveUser, updateUser, userLogin} from "../controllers/userController";
import {authenticateUser} from "../middelware/auth";

const router = Router()

router.post('/register', saveUser)
router.get('/get/:email', getUser)
router.get('/get-all', getAllUser)
router.put('/update/:email' , updateUser)
router.delete('/delete/:email', deleteUser)

export default router;
