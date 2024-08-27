import mongoose, { Schema } from "mongoose";


const questionSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // for multiple choice
    options: [
        { type: String }
    ],
    correctAnswer: {
        type: Schema.Types.Mixed
    },
    points: {
        type: Number
    }
}, { timestamps: true })


export const Question = mongoose.model("Question", questionSchema)
