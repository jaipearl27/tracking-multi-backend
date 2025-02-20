import express from "express"
import { connectMongo } from "./src/config/db/mongoConfig.js"
import dotenv from "dotenv"
import authRouter from "./src/routes/auth.js"
import cors from 'cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000


app.use(express.json())

app.use(cors({
    origin: [
        '*'
    ],
    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE'
    ],
    // credentials: true,
}))

app.use('/api/v1/auth', authRouter)



app.get("/", (req, res) => {
    res.send("API is running...")
})

app.listen(PORT, () => {
    console.log(`Server is running or port ${PORT}`)
    connectMongo()
})