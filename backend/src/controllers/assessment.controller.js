import { Assessment } from "../models/assessment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler";


const getAssessments = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;
    try {
        const assessments = await Assessment.find({ creatorId: userId });

        return res
            .status(200)
            .json(
                new ApiResponse(200, assessments, "Assessments fetched successfully")
            )
    } catch (error) {
        return res.status(500).json({ message: "Something occurred while fetching the assessments" })
    }
})


const createAssessment = AsyncHandler(async (req, res) => {
    const {
        title,
        type,
        instructions,
        timeLimit,
        feedbackType
    } = req.body;

    if (!title || !type || !instructions || !feedbackType || timeLimit === undefined) {
        return res
            .status(400)
            .json({ message: "All fields are required" })
    }

    if (typeof timeLimit !== 'number' || isNaN(timeLimit)) {
        return res
            .status(400)
            .json({ message: "timeLimit must be a valid number" });
    }

    const assessment = await Assessment.create(
        {
            title,
            type,
            instructions,
            timeLimit,
            creatorId: req.user?._id,
            feedbackType
        }
    )

    if (!assessment) {
        return res
            .status(500).json({ message: "Something occurred while creating assessment" })
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, assessment, "Assessment created successfully")
        )
})


const searchAssessments = AsyncHandler(async (req, res) => {
    const { query } = req.query
    const userId = req.user?._id
    try {
        const assessment = await Assessment.find({
            creatorId: userId,
            title: { $regex: query, $option: 'i' }
        })

        return res
            .status(200)
            .json(
                new ApiResponse(200, assessment, "Assessment got successfully")
            )
    } catch (error) {
        return res.status(500).json({ message: "Something occurred while finding assessments" })
    }
})


const filterAssessments = AsyncHandler(async (req, res) => {
    const { type, sortBy } = req.query
    const userId = req.user?._id
    try {
        let query = { creatorId: userId }
        if (type) query.type = type

        let sort = {}
        if (sortBy === "Date") sort.createdAt = -1
        if (sortBy === "title") sort.title = 1

        const assessment = await Assessment.find(query).sort(sort)

        return res
            .status(200)
            .json(new ApiResponse(200, assessment, "Assessment filtered successfully"))
    } catch (error) {
        return res
            .status(501).json({ message: "Something occurred while filtering the assessments" })
    }
})


export { getAssessments, createAssessment, searchAssessments, filterAssessments }