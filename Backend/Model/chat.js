import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
     pdfUploaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;