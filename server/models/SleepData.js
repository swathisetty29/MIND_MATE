import mongoose from "mongoose";

const sleepDataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    hours: { type: Number, required: true, min: 0, max: 24 },
  },
  { timestamps: true }
);

sleepDataSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("SleepData", sleepDataSchema);
