import { User } from "../models/user.model.js"
import AsyncHandler from "../utils/AsyncHandler.js"
import jwt from "jsonwebtoken"

export const verifyJWT = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" })
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY)
        const user = await User.findById(decodedToken._id).select("-password")
        if (!user) {
            return res.status(401).json({ message: "Invalid token provided" })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(500).json({ message: error.message || "Invalid token" })
    }
})