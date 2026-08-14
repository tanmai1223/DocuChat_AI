import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
   chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true, 
    },
    text: {
      type: String,
      required: true,
      trim: true, 
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;