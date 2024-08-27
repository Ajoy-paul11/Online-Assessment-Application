import mongoose, { Schema } from "mongoose";


const activitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    assessmentId: {
        type: Schema.Types.ObjectId,
        ref: "Assessment"
    },
    activityType: {
        type: String,
    },

}, { timestamps: true })


export const Activity = mongoose.model("Activity", activitySchema); 