import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { QuestionBank } from "../models/questionBank.model.js";
import { Question } from "../models/question.model.js";


const getQuestionBank = AsyncHandler(async (req, res) => {
    const { search, tags, category } = req.query
    const userId = req.user?._id

    let query = { creatorId: userId }

    if (search) {
        query.$or = [
            { "question.content": { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ]
    }

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };

    const questionBank = await QuestionBank.findOne(query).populate("question")

    if (!questionBank) {
        return res
            .status(401)
            .json({ message: "Question bank not found for this user." })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, questionBank, "Question bank fetched successfully"))
})


const createQuestion = AsyncHandler(async (req, res) => {
    const { content, type, options, correctAnswer, points, category, tags } = req.body;
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
                .status(500).json({ message: "Something occurred while creating question in question bank" })
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
            questionBank.tags = [...new Set([...questionBank.tags, ...tags])];
        }

        await questionBank.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new ApiResponse(200, addQuestion, "Question created and add successfully"))
    } catch (error) {
        return res.status(500).json({ message: "Internal server error while question is set to assessment and bank" })
    }
})


const updateQuestion = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, type, options, correctAnswer, points, category, tags } = req.body;

    const questionUpdated = await Question.findByIdAndUpdate(
        id,
        { content, type, options, correctAnswer, points },
        { new: true }
    )

    if (!questionUpdated) {
        return res
            .status(500)
            .json({ message: "Question not found, operational in question bank" })
    }

    if (category || tags) {
        const questionBank = await QuestionBank.findOne({ creatorId: req.user?._id });
        if (questionBank) {
            if (category && !questionBank.category.includes(category)) {
                questionBank.category = category
            }
            if (tags) {
                questionBank.tags = [...new Set([...questionBank.tags, ...tags])];
            }
            await questionBank.save();
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateQuestion, "Question has updated successfully"))
})


const deleteQuestion = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const deletedQuestion = await Question.findByIdAndDelete(id);
        if (!deletedQuestion) {
            return res
                .status(404)
                .json({ message: "Question not found" });
        }

        // Remove question from QuestionBank
        await QuestionBank.updateOne(
            { creatorId: req.user?._id },
            { $pull: { question: id } }
        );
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Question has deleted successfully"))

    } catch (error) {
        return res
            .status(500)
            .json({ message: "Something occurred while delete question from question bank." })
    }
})


const importQuestions = AsyncHandler(async (req, res) => {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
        return res
            .status(400)
            .json({ message: "Invalid questions data" });
    }

    try {
        const importedQuestions = await Question.insertMany(questions);
        const questionBank = await QuestionBank.findOne({ creatorId: req.user?._id });

        if (questionBank) {
            questionBank.questions.push(...importedQuestions.map(q => q._id));
            await questionBank.save();
        } else {
            await QuestionBank.create({
                creatorId: req.user?._id,
                questions: importedQuestions.map(q => q._id),
                tags: [...new Set(importedQuestions.flatMap(q => q.tags))],
                category: importedQuestions.map(q => q.category)
            });
        }

        return res
            .status(200)
            .json(new ApiResponse(200, importedQuestions, "Questions imported successfully"));
    } catch (error) {
        return res.status(500).json({ message: "Error importing questions" });
    }
});


const exportQuestions = AsyncHandler(async (req, res) => {
    const questionBank = await QuestionBank.findOne({ creatorId: req.user?._id }).populate("questions");

    if (!questionBank) {
        return res.status(404).json({ message: 'Question bank not found for this user' });
    }

    const exportData = questionBank.question.map(q => ({
        content: q.content,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, exportData, "Questions exported successfully"));
});


export {
    getQuestionBank,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestions,
    exportQuestions
}