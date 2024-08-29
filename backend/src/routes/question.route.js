import { Router } from "express";
import {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionBank
} from "../controllers/question.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router()

router.use(verifyJWT)

router.route("/create").post(createQuestion)
router.route("/:id").patch(updateQuestion)
router.route("/:id").delete(deleteQuestion)
router.route("/question-bank").get(getQuestionBank)


export default router;