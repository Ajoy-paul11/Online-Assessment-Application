import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { StudentAssessment } from "../models/student.model.js";
import { User } from "../models/user.model.js";

const getStudentAssessmentReview = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const studentId = req.user._id;

    const submission = await Submission.findOne({ studentId, assessmentId })
        .populate('assessmentId')
        .populate('answers.questionId');

    if (!submission) {
        return res.status(404).json({ message: "Assessment not found" });
    }

    return res.status(200).json(new ApiResponse(200, submission, "Assessment review retrieved successfully"));
});


const getStudentAssessmentAttempts = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const studentId = req.user._id;

    const attempts = await Submission.find({ studentId, assessmentId })
        .select('score submissionDate ')
        .sort('-submissionDate');

    return res.status(200).json(new ApiResponse(200, attempts, "Assessment attempts retrieved successfully"));
});


const provideTeacherFeedback = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const studentId = req.user?._id;
    const { overallComment, grade } = req.body;

    if (req.user.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can provide feedback" });
    }

    const studentAssessment = await StudentAssessment.findOneAndUpdate(
        { studentId, assessmentId },
        {
            teacherFeedback: {
                overallComment,
                grade,
                feedbackDate: new Date()
            }
        },
        { new: true }
    );

    if (!studentAssessment) {
        return res.status(404).json({ message: "Assessment not found to update teacher feedback" });
    }

    return res.status(200).json(new ApiResponse(200, studentAssessment, "Teacher feedback provided successfully"));
});


const generateAssessmentReport = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const studentId = req.user._id;

    const studentAssessment = await StudentAssessment.findOne({ studentId, assessmentId })
        .populate('assessmentId')
        .populate('answers.questionId');

    if (!studentAssessment) {
        return res.status(404).json({ message: "Assessment not found to generate assessment report" });
    }

    const report = {
        studentName: req.user.username,
        assessmentTitle: studentAssessment.assessmentId.title,
        score: studentAssessment.score,
        totalQuestions: studentAssessment.answers.length,
        teacherFeedback: studentAssessment.teacherFeedback,
    };

    return res.status(200).json(new ApiResponse(200, report, "Assessment report generated successfully"));
});


export {
    getStudentAssessmentReview,
    getStudentAssessmentAttempts,
    provideTeacherFeedback,
    generateAssessmentReport
};