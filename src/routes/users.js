import express from 'express'
import { createUser, deleteUser, getAllUsers, getUserInfo, updateUser } from '../controllers/users.js'
import { authenticateToken } from '../middlewares/authenticateToken.js'

const usersRouter = express.Router()

usersRouter.route('/').get(getAllUsers)
usersRouter.route('/').post(createUser)
usersRouter.route('/:id').get(authenticateToken, getUserInfo).patch(updateUser).delete(deleteUser)

export default usersRouter