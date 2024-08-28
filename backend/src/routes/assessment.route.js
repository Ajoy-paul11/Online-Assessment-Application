import { Router } from "express";
import {
    getAllAssessments,
    createAssessment,
    getAssessment,
    updateAssessment,
    deleteAssessment,
    searchAssessments, filterAssessments
} from "../controllers/assessment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()


router.route("/").get(verifyJWT, getAllAssessments)
router.route("/").post(verifyJWT, createAssessment)
router.route("/:id").get(verifyJWT, getAssessment)
router.route("/:id").patch(verifyJWT, updateAssessment)
router.route("/:id").delete(verifyJWT, deleteAssessment)
router.route("/search").get(verifyJWT, searchAssessments)


export default router;