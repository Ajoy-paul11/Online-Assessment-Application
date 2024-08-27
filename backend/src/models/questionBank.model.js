import mongoose, { Schema } from "mongoose";


const questionBankSchema = new Schema({
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    question: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Question"
        }
    ],
    category: {
        type: String,
    },
    tags: [
        { type: String }
    ]
}, { timestamps: true })


export const QuestionBank = mongoose.model("QuestionBank", questionBankSchema)
