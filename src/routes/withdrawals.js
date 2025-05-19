// routes/withdrawalRoutes.js
import express from 'express';
import {
    createWithdrawal,
    getAllWithdrawals,
    getWithdrawalById,
    updateWithdrawal,
    deleteWithdrawal,
    getWithdrawalsByUserId,
    // getAvailablePayouts,
    getWithdrawals
} from '../controllers/withdrawals.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';


const router = express.Router();

router.use(authenticateToken)

router.route('/')
    .post(createWithdrawal)
    .get(getWithdrawals);

// router.route("/available-payouts").get(getWithdrawals)


router.route('/:id')
    .get(getWithdrawalById) 
    .put(updateWithdrawal)  
    .delete(deleteWithdrawal); 


router.route('/user/:userId')
    .get(getWithdrawalsByUserId); 

export default router;