import express from "express"
import { connectMongo } from "./src/config/db/mongoConfig.js"
import dotenv from "dotenv"
import cors from 'cors'
import { error } from "./src/middlewares/errorMiddleware.js"
import swaggerSetup from "./swagger.js"

// routes
import authRouter from "./src/routes/auth.js"
import usersRouter from "./src/routes/users.js"
import trackingLinksRouter from "./src/routes/trackingLinks.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000


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
}))


// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/trackingLinks', trackingLinksRouter)

app.use(error);

app.get("/", (req, res) => {
    res.send("API is running...")
})

swaggerSetup(app)

app.listen(PORT, () => {
    console.log(`Server is running or port ${PORT}`)
    connectMongo()
})