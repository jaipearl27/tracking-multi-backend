import express from 'express'
import { createUser, deleteUser, getAllUsers, getUser, updateUser } from '../controllers/users.js'

const usersRouter = express.Router()

usersRouter.route('/').get(getAllUsers)
usersRouter.route('/').post(createUser)
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)


export default usersRouter