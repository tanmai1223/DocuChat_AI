import Message from "../Model/message.js";
import Chat from "../Model/chat.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.id,
    }).sort({ createdAt: 1, _id: 1 });
    res.json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Could not fetch prompt",
      });
    }
  }
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: chats,
    });
  } catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Could not fetch chats",
      });
    }
  }
};

export const renameChat=async(req,res)=>{
  try{
    const id=req.params.id;
    const {title}=req.body;

    const chat=await Chat.findById(id);

    if(!chat){
      return res.status(404).json({message: "Chat not found" })
    }

    if(!title){
      return res.status(400).json({message: "Flied cant be empty" })
    }

    chat.title=title;
    await chat.save();
    res.status(200).json({ message: "Title updated", data: chat });

  }catch (err) {
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Could not fetch chats",
      });
    }
  }
}

