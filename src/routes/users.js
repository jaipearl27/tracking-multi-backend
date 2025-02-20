import express from 'express'
import { deleteUser, deleteUser, getAllUsers, getUser, updateUser } from '../controllers/users'

const usersRouter = express.Router()

usersRouter.route('/user').get(getAllUsers)
usersRouter.route('/user/:id').get(getUser).patch(updateUser).delete(deleteUser)
