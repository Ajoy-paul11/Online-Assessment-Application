import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Assessment } from "../models/assessment.model.js";
import { StudentAssessment } from "../models/studentAssessment.model.js";
import { Question } from "../models/question.model.js";


const startAssessment = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const studentId = req.user?._id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
    }

    let studentAssessment = await StudentAssessment.findOne({ studentId, assessmentId });
    if (studentAssessment) {
        return res.status(200).json(new ApiResponse(200, studentAssessment, "Assessment already in progress"));
    }

    studentAssessment = await StudentAssessment.create({
        studentId,
        assessmentId,
        answers: assessment.questions.map(q => ({ questionId: q, answer: null })),
        startTime: new Date()
    });

    const assessmentData = {
        title: assessment.title,
        instructions: assessment.instructions,
        duration: assessment.duration,
        questions: await Question.find({ _id: { $in: assessment.questions } }).select('content type options')
    };

    return res.status(200).json(new ApiResponse(200, { studentAssessment, assessmentData }, "Assessment started successfully"));
});


const saveProgress = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const { answers, progress } = req.body;
    const studentId = req.user?._id;

    const studentAssessment = await StudentAssessment.findOne({ studentId, assessmentId });
    if (!studentAssessment) {
        return res.status(404).json({ message: "Student assessment not found" });
    }

    studentAssessment.answers = answers;
    studentAssessment.progress = progress;
    await studentAssessment.save();

    return res.status(200).json(new ApiResponse(200, studentAssessment, "Progress saved successfully"));
});


const submitAssessment = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const { answers } = req.body;
    const studentId = req.user?._id;

    const studentAssessment = await StudentAssessment.findOne({ studentId, assessmentId });
    if (!studentAssessment) {
        return res.status(404).json({ message: "Student assessment not found" });
    }

    const assessment = await Assessment.findById(assessmentId).populate('questions');

    let score = 0;
    const gradedAnswers = await Promise.all(answers.map(async (answer) => {
        const question = assessment.questions.find(q => q._id.toString() === answer.questionId);

        if (!question) {
            return { ...answer, isCorrect: false, error: "Question not found" };
        }

        let isCorrect = false;

        switch (question.type) {
            case 'multiple choice':
                isCorrect = question.correctAnswer === answer.answer;
                break;
            case 'short answer':
                // For short answers, you might want to implement a more flexible comparison
                isCorrect = question.correctAnswer.toLowerCase() === answer.answer.toLowerCase();
                break;
            case 'essay':
                // Essays typically require manual grading
                isCorrect = null; // Indicates manual grading needed
                break;
            default:
                return { ...answer, isCorrect: false, error: "Unknown question type" };
        }

        if (isCorrect) {
            score += question.points || 0; // Add points if correct, default to 0 if points not specified
        }

        return { ...answer };
    }));

    studentAssessment.answers = gradedAnswers;
    studentAssessment.score = score;
    studentAssessment.status = 'submitted';
    await studentAssessment.save();

    const feedback = assessment.feedbackType === 'immediate' ? studentAssessment : null;

    return res.status(200).json(new ApiResponse(200, feedback, "Assessment submitted successfully"));
});


const getAssessmentDetails = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const studentId = req.user?._id;

    const assessment = await Assessment.findById(assessmentId).select('-questions.correctAnswer');
    if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
    }

    const studentAssessment = await StudentAssessment.findOne({ studentId, assessmentId });

    const response = {
        assessment,
        progress: studentAssessment ? studentAssessment.progress : 0,
        answers: studentAssessment ? studentAssessment.answers : []
    };

    return res.status(200).json(new ApiResponse(200, response, "Assessment details retrieved successfully"));
});


export {
    startAssessment,
    saveProgress,
    submitAssessment,
    getAssessmentDetails
};