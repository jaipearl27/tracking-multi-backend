import express from "express"
import { connectMongo } from "./src/config/db/mongoConfig.js"
import dotenv from "dotenv"
import cors from 'cors'
import { error } from "./src/middlewares/errorMiddleware.js"
import swaggerSetup from "./swagger.js"

import "./src/utils/scheduler.js"

// routes
import authRouter from "./src/routes/auth.js"
import usersRouter from "./src/routes/users.js"
import trackingLinksRouter from "./src/routes/impact/trackingLinks.js"
import clicksRouter from "./src/routes/impact/clicks.js"
import assignmentsRouter from "./src/routes/impact/assignments.js"
import actionsRouter from "./src/routes/impact/actions.js"


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001


app.use(express.json())

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
    ],
    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE'
    ],
    // credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]

}))


// routes v1 for impact
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/trackingLinks', trackingLinksRouter)
app.use('/api/v1/clicks', clicksRouter)
app.use('/api/v1/assignments', assignmentsRouter)
app.use('/api/v1/actions', actionsRouter)

// routes v2 for partnerize


app.use(error);

app.get("/", (req, res) => {
    res.send("API is running...")
})

swaggerSetup(app)

app.listen(PORT, () => {
    console.log(`Server is running or port ${PORT}`)
    connectMongo()
})