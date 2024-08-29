import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Assessment } from "../models/assessment.model.js";
import { StudentAssessment } from "../models/studentAssessment.model.js";
import { Question } from "../models/question.model.js";
import { Submission } from "../models/submission.model.js"


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

    answers.forEach(answer => {
        const questionIndex = studentProgress.answers.findIndex(a => a.questionId.toString() === answer.questionId);
        if (questionIndex !== -1) {
            studentProgress.answers[questionIndex].answer = answer.answer;
        }
    });

    // Calculate score
    let score = 0;
    const questions = await Question.find({ _id: { $in: assessment.questions } });
    studentAssessment.answers.forEach(answer => {
        const question = questions.find(q => q._id.toString() === answer.questionId.toString());
        if (question && question.correctAnswer === answer.answer) {
            score++;
        }
    });

    const submission = await Submission.create({
        studentId,
        assessmentId,
        answers: studentAssessment.answers,
        score,
        submissionDate: new Date()
    });

    const feedback = assessment.feedbackType === 'immediate' ? studentAssessment : null;

    return res.status(200).json(new ApiResponse(200, submission, "Assessment submitted successfully"));
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