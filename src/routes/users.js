import express from 'express'
import { createUser, deleteUser, getAllUsers, getUser, getUserInfo, updateUser } from '../controllers/users.js'
import { authenticateToken } from '../middlewares/authenticateToken.js'

const usersRouter = express.Router()

usersRouter.route('/').get(authenticateToken, getAllUsers).post(authenticateToken, createUser)
usersRouter.route('/info').get(authenticateToken, getUserInfo)
usersRouter.route('/:id').get(getUser).patch(authenticateToken, updateUser).delete(authenticateToken, deleteUser)

export default usersRouter