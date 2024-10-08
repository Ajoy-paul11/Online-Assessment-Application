import { Router } from "express"
import {
    getQuestionBank,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestions,
    exportQuestions
} from "../controllers/questionBank.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router()

router.use(verifyJWT)

router.route("/").get(getQuestionBank)
router.route("/create").post(createQuestion)
router.route("/:id").patch(updateQuestion)
router.route("/:id").delete(deleteQuestion)
router.route("/import").post(importQuestions)
router.route("/export").get(exportQuestions)


export default router;