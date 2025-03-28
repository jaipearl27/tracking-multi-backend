import express from 'express'
import { createUser, deleteUser, getAllUsers, getUser, getUserInfo, updateUser } from '../controllers/users.js'
import { authenticateToken } from '../middlewares/authenticateToken.js'

const usersRouter = express.Router()

usersRouter.route('/').get(getAllUsers).post(createUser)
usersRouter.route('/info').get(authenticateToken, getUserInfo)
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default usersRouter