// routes/withdrawalRoutes.js
import express from 'express';
import {
    createWithdrawal,
    getAllWithdrawals,
    getWithdrawalById,
    updateWithdrawal,
    deleteWithdrawal,
    getWithdrawalsByUserId
} from '../controllers/withdrawals.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';


const router = express.Router();

router.use(authenticateToken)

router.route('/')
    .post(createWithdrawal)
    .get(getAllWithdrawals);


router.route('/:id')
    .get(getWithdrawalById) 
    .put(updateWithdrawal)  
    .delete(deleteWithdrawal); 


router.route('/user/:userId')
    .get(getWithdrawalsByUserId); 

export default router;