import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Question } from "../models/question.model.js";
import { Assessment } from "../models/assessment.model.js";
import { QuestionBank } from "../models/questionBank.model.js";


const createQuestion = AsyncHandler(async (req, res) => {
    const { content, type, options, correctAnswer, points, category, tags, assessmentId } = req.body;
    if (!content || !type || !options || !correctAnswer || !category || !tags || points === undefined) {
        return res
            .status(400)
            .json({ message: "All fields are required" })
    }

    try {
        const addQuestion = await Question.create(
            {
                content,
                type,
                options,
                correctAnswer,
                points,
            }
        )

        if (!addQuestion) {
            return res
                .status(500).json({ message: "Something occurred while creating question" })
        }

        let questionBank = await QuestionBank.findOne({ creatorId: req.user?._id })
        if (!questionBank) {
            questionBank = new QuestionBank(
                {
                    creatorId: req.user?._id,
                    question: [addQuestion._id],
                    tags,
                    category
                }
            )
        } else {
            questionBank.question.push(addQuestion._id)
            if (category) questionBank.category = category
            if (tags) questionBank.tags = tags
        }

        await questionBank.save({ validateBeforeSave: false })

        if (assessmentId) {
            await Assessment.findByIdAndUpdate(
                assessmentId,
                {
                    $push: { questions: addQuestion._id }
                },
                { new: true }
            )
        }

        return res
            .status(200)
            .json(new ApiResponse(200, addQuestion, "Question created and add successfully"))
    } catch (error) {
        return res.status(500).json({ message: "Internal server error while question is set to assessment and bank" })
    }
})


const updateQuestion = AsyncHandler(async (req, res) => {
    const questionUpdated = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )

    if (!questionUpdated) {
        return res
            .status(500)
            .json({ message: "Internal server error while updating the question" })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateQuestion, "Question has updated successfully"))
})


const deleteQuestion = AsyncHandler(async (req, res) => {
    const questionDeleted = await Question.findByIdAndDelete(req.params.id)
    if (!questionDeleted) {
        return res
            .status(501)
            .json({ message: "Server error while deletion the question" })
    }

    await Assessment.updateMany(
        { questions: req.params.id },
        { $pull: { questions: req.params.id } }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Question has deleted successfully"))

})


const getQuestionBank = AsyncHandler(async (req, res) => {
    const questionBank = await QuestionBank.findOne(
        { creatorId: req.user?._id }
    ).populate("question")

    if (!questionBank) {
        return res.status(404).json({ message: 'Question bank not found for this user' });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, questionBank, "Question Bank got successfully"))
})


export { createQuestion, updateQuestion, deleteQuestion, getQuestionBank }