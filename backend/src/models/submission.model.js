import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema({
    questionId: {
        types: Schema.Types.ObjectId,
        ref: "Question"
    },
    answer: {
        type: Schema.Types.Mixed
    }
});

const submissionSchema = new Schema({
    assessmentId: {
        type: Schema.Types.ObjectId,
        ref: "Assessment"
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    answers: [answerSchema],
    submissionDate: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number
    }
})


export const Submission = mongoose.model("Submission", submissionSchema)
