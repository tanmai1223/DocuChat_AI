import { Router } from "express";
import { getChats, getMessages, renameChat } from "../Controllers/chatControllers.js";
const chatRoutes=Router();

chatRoutes.get("/chats", getChats);
chatRoutes.patch("/rename/:id", renameChat);
chatRoutes.get("/messages/:id", getMessages);

export default chatRoutes;