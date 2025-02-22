import express from 'express'
import { deleteUser, getAllUsers, getUser, updateUser } from '../controllers/users.js'

const usersRouter = express.Router()

usersRouter.route('/').get(getAllUsers)
usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)


export default usersRouter