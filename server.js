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
import assignmentsRouter from "./src/routes/assignments.js"
import actionsRouter from "./src/routes/impact/actions.js"
import cookieParser from "cookie-parser"
import { tokenVerification } from "./src/controllers/auth.js"
import partnerizeTrackingLinkRouter from "./src/routes/partnerize/TrackingLinks.js"
import partnerizeClicksRouter from "./src/routes/partnerize/Clicks.js"
import partnerizeConversionsRouter from "./src/routes/partnerize/Conversions.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cookieParser());
app.use(express.json())

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://tracking-mern.vercel.app'
    ],
    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE'
    ],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
}))

//token auth route
app.get('/api/v1/me', tokenVerification)
app.use('/api/v1/assignments', assignmentsRouter)

// routes for impact
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/trackingLinks', trackingLinksRouter)
app.use('/api/v1/clicks', clicksRouter)
app.use('/api/v1/actions', actionsRouter)

// routes for partnerize exclusively
app.use('/api/v2/trackingLinks', partnerizeTrackingLinkRouter)
app.use('/api/v2/clicks', partnerizeClicksRouter)
app.use('/api/v2/conversions', partnerizeConversionsRouter)

app.use(error);
app.get("/", (req, res) => {
    res.send("API is running...")
})

swaggerSetup(app)

app.listen(PORT, () => {
    console.log(`Server is running or port ${PORT}`)
    connectMongo()
})