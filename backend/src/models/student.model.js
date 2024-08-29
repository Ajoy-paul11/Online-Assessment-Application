import mongoose, { Schema } from "mongoose";


const studentAssessmentSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assessmentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    answers: [{
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question"
        },
        answer: Schema.Types.Mixed,
    }],
    progress: {
        type: Number,
        default: 0
    },
    score: {
        type: Number
    },
    status: {
        type: String,
        enum: ['in-progress', 'submitted', 'graded'],
        default: 'in-progress'
    }

}, { timestamps: true })


export const StudentAssessment = mongoose.model("StudentAssessment", studentAssessmentSchema)