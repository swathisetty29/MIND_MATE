import mongoose from "mongoose";

const peerMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "PeerSession", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true }
);

export default mongoose.model("PeerMessage", peerMessageSchema);
