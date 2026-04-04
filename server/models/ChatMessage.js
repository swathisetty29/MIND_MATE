import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    sentiment: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
