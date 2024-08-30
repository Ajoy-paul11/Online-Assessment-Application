import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Assessment } from "../models/assessment.model.js";
import { Question } from "../models/question.model.js";


const getStudentSubmissionsList = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;

    const submissions = await Submission.find({ assessmentId })
        .populate('studentId', 'username')
        .select('studentId submissionDate score');

    if (!submissions) {
        return res.status(500).json({ message: "Something occurred while getting the submission list." })
    }

    return res.status(200).json(new ApiResponse(200, submissions, "Student submissions list retrieved successfully"));
});


const gradeIndividualQuestion = AsyncHandler(async (req, res) => {
    const { submissionId, questionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
    }

    const questionIndex = submission.answers.findIndex(answer => answer.questionId.toString() === questionId);
    if (questionIndex === -1) {
        return res.status(404).json({ message: "Question not found in submission" });
    }

    submission.answers[questionIndex].score = score;
    submission.answers[questionIndex].feedback = feedback;

    // Recalculate total score
    submission.score = submission.answers.reduce((total, answer) => total + (answer.score || 0), 0);

    await submission.save();

    return res.status(200).json(new ApiResponse(200, submission, "Question graded successfully"));
});


const bulkGradeSubmissions = AsyncHandler(async (req, res) => {
    const { assessmentId } = req.params;
    const { grades } = req.body; // Array of { submissionId, score, feedback }

    const bulkOps = grades.map(grade => ({
        updateOne: {
            filter: { _id: grade.submissionId, assessmentId },
            update: {
                $set: {
                    score: grade.score,
                    'teacherFeedback.overallComment': grade.feedback,
                    'teacherFeedback.grade': grade.score,
                    'teacherFeedback.feedbackDate': new Date()
                }
            }
        }
    }));

    const result = await Submission.bulkWrite(bulkOps);

    return res.status(200).json(new ApiResponse(200, result, "Bulk grading completed successfully"));
});


const reviewAutomatedGrading = AsyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { adjustedGrades } = req.body;

    const submission = await Submission.findByIdAndUpdate(
        submissionId,
        {
            $set: {
                'answers.$[].grade': adjustedGrades,
                'reviewedByTeacher': true
            }
        },
        { new: true }
    );

    // Recalculate total score
    const totalScore = adjustedGrades.reduce((sum, grade) => sum + grade, 0);
    submission.score = totalScore;
    await submission.save();

    return res.status(200).json(
        new ApiResponse(200, submission, "Automated grading reviewed successfully")
    );
});


const handleRegradeRequest = AsyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { questionId, regradeReason } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
    }

    const questionIndex = submission.answers.findIndex(answer => answer.questionId.toString() === questionId);
    if (questionIndex === -1) {
        return res.status(404).json({ message: "Question not found in submission" });
    }

    submission.answers[questionIndex].regradeRequest = {
        reason: regradeReason,
        status: 'pending'
    };

    await submission.save();

    return res.status(200).json(new ApiResponse(200, submission, "Regrade request submitted successfully"));
});


export {
    getStudentSubmissionsList,
    gradeIndividualQuestion,
    bulkGradeSubmissions,
    reviewAutomatedGrading,
    handleRegradeRequest
}