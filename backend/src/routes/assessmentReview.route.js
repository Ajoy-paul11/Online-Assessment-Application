import { Router } from "express";
import {
    getStudentAssessmentReview,
    getStudentAssessmentAttempts,
    provideTeacherFeedback,
    generateAssessmentReport
} from "../controllers/assessmentReview.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()

router.use(verifyJWT)

router.route("/:assessmentId/get-review").get(getStudentAssessmentReview)
router.route("/:assessment/getAttempts").get(getStudentAssessmentAttempts)
router.route("/:assessmentId/provide-review").post(provideTeacherFeedback)
router.route("/:assessment/report").get(generateAssessmentReport)


export default router;