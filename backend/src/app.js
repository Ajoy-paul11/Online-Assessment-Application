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
import assessmentRoutes from "./routes/assessment.route.js"
import questionRoutes from "./routes/question.route.js"
import questionBankRouter from "./routes/questionBank.route.js"


// declare routes
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/assessments", assessmentRoutes)
app.use("/api/v1/questions", questionRoutes)
app.use("/api/v1/question-bank", questionBankRouter)


export { app };