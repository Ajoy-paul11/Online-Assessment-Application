import { Router } from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import {
    getStudentSubmissionsList,
    gradeIndividualQuestion,
    bulkGradeSubmissions,
    reviewAutomatedGrading,
    handleRegradeRequest
} from "../controllers/gradeAndReview.controller.js"


const router = Router()

router.use(verifyJWT)

router.route("/:assessmentId/list").get(getStudentSubmissionsList)
router.route("/:submissionId/:questionId/grade").post(gradeIndividualQuestion)
router.route("/:assessmentId/bulk-grade").post(bulkGradeSubmissions)
router.route("/:submissionId/review").get(reviewAutomatedGrading)
router.route("/:submissionId/regrade-request").post(handleRegradeRequest)


export default router;