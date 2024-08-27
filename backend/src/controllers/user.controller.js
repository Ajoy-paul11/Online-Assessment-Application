import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";


const tokenGenerate = async (userId) => {
    const user = await User.findById(userId);
    const token = user.generateToken()

    user.token = token
    await user.save({ validateBeforeSave: false })

    return { token }
}

const registerUser = AsyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body
    if ([username, email, password, role].some(field => field?.trim === "")) {
        return res.status(400).json({ message: "Fields can't be empty" })
    }

    const getUser = await User.findOne({ email })

    if (getUser) {
        return res.status(400).json({ message: "User with Email already exists" })
    }

    const user = User.create({
        username,
        email,
        password,
        role
    })

    const createdUser = await User.findById(user._id).select("-password -token")

    if (!createdUser) {
        throw new ApiError(500, "Something occurred while registering the user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
})


const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email?.trim() || !password?.trim()) {
        return res
            .status(400).json({ message: "Field can't be empty" })
    }

    const getUser = await User.findOne({ email })

    if (!getUser) {
        return res
            .status(400).json({ message: "User not found" })
    }

    const checkPassword = await getUser.isPasswordCorrect(password)

    if (!checkPassword) {
        return res.status(401).json({ message: "Entered Password is incorrect" })
    }

    const { token } = await tokenGenerate(getUser._id)

    const loggedInUser = await User.findById(getUser._id).select("-password -token")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("token", token, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, token }, "User logged in successfully")
        )
})


const logoutUser = AsyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: { token: "" }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("token", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})


export { registerUser, loginUser, logoutUser }