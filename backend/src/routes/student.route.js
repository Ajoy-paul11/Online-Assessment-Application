import { Router } from "express";
import {
    startAssessment,
    saveProgress,
    submitAssessment,
    getAssessmentDetails
} from "../controllers/student.controller";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()

router.use(verifyJWT)

router.route("/:assessmentId/start").post(startAssessment)
router.route("/:assessmentId/progress").post(saveProgress)
router.route("/:assessmentId/submit").post(submitAssessment)
router.route("/:assessmentId/details").get(getAssessmentDetails)


export default router;