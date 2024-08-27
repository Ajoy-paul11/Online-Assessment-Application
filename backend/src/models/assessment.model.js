import mongoose, { Schema } from "mongoose";


const assessmentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["multiple choice", "short answer", "essay"],
    },
    Instructions: {
        type: String,
    },
    timeLimit: {
        type: Number,
    },
    questions: [
        { type: Schema.Types.ObjectId, ref: "Question" }
    ],
    feedbackType: {
        type: String,
    }

}, { timestamps: true })


export const Assessment = mongoose.model("Assessment", assessmentSchema)
