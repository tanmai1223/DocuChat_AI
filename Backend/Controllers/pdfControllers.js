import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import Chat from "../Model/chat.js";
import qdrant from "../Services/qdrant.js";
const COLLECTION_NAME = "pdf_documents";
import crypto from "crypto";
import Message from "../Model/message.js";

export const uploadPDF = async (req, res) => {
  try {
    let { chatId } = req.body;

    // No chatId → create a new chat
    if (!chatId) {
      const chat = await Chat.create({
        title: req.file.originalname,
      });

      chatId = chat._id.toString();

      console.log("New chat created:", chatId);
    } else {
      // chatId exists → check that chat exists
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
        });
      }

      // Don't allow another PDF in the same chat
      if (chat.pdfUploaded) {
        return res.status(400).json({
          message:
            "This chat already has a PDF. Please create a new chat for another PDF.",
        });
      }

      console.log("Using existing chat:", chatId);
    }

    const filePath = req.file.path;

    const loader = new PDFLoader(filePath);

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(docs);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-embedding-001",
    });

    const vectors = await embeddings.embedDocuments(
      chunks.map((chunk) => chunk.pageContent),
    );

    /*console.log("Chunks:", chunks.length);
    console.log("Vectors:", vectors.length);
    console.log("First vector:", vectors[0]);
    console.log("First vector length:", vectors[0]?.length);*/

    const points = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(),
      vector: vectors[index],
      payload: {
        chatId: chatId.toString(),
        text: chunk.pageContent,
        metadata: chunk.metadata,
        fileName: req.file.originalname,
      },
    }));

    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });
    await Chat.findByIdAndUpdate(chatId, {
      pdfUploaded: true,
    });
    await Message.create([
  {
    chatId,
    text: `📄 ${req.file.originalname}`,
    role: "user",
  },
  {
    chatId,
    text: "PDF uploaded successfully! Start asking questions.",
    role: "assistant",
  },
]);

    res.status(200).json({
      message: "PDF uploaded and indexed successfully",
      chatId,
      pages: docs.length,
      chunks: chunks.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const postQuery = async (req, res) => {
  try {
    const { chatId, query } = req.body;

    if (!chatId || !query) {
      return res.status(400).json({
        message: "chatId and query are required",
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    console.log("User question:", query);
    console.log("Chat:", chatId);

    // 1. Create embedding for question
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-embedding-001",
    });

    const queryVector = await embeddings.embedQuery(query);

    // 2. Search ONLY this chat's PDF
    const searchResult = await qdrant.query(COLLECTION_NAME, {
      query: queryVector,
      limit: 3,
      with_payload: true,

      filter: {
        must: [
          {
            key: "chatId",
            match: {
              value: chatId.toString(),
            },
          },
        ],
      },
    });

    // 3. Extract relevant PDF text
    const context = searchResult.points
      .map((point) => point.payload.text)
      .join("\n\n");

    // 4. Ask Gemini
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-3.1-flash-lite",
      temperature: 0,
    });

    const response = await model.invoke(`
You are a PDF question-answering assistant.

Answer the user's question using ONLY the information
provided in the context.

If the answer is not present in the context, say:
"I couldn't find the answer in the provided PDF."

Context:
${context}

Question:
${query}
`);

    // 5. Save user message
    await Message.create({
      chatId,
      text: query,
      role: "user",
    });

    // 6. Save assistant message
    await Message.create({
      chatId,
      text: response.content,
      role: "assistant",
    });

    // 7. Return answer
    res.status(200).json({
      answer: response.content,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};
