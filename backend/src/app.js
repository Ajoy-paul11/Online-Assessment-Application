import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.json(
    {
        limit: "16kb"
    }
))

app.use(express.urlencoded(
    {
        extended: true,
        limit: "16kb"
    }
))

app.use(cookieParser())

// import routes
import userRoutes from "./routes/user.route.js"


// declare routes
app.use("/api/v1/user", userRoutes)


export { app };