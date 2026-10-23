# 📄 DocuChat AI

A RAG-based PDF question-answering application that allows users to upload a PDF and have a conversation with it.

Each chat has its own PDF and conversation history, so documents remain isolated from one another. Users can ask follow-up questions while the chatbot uses both the PDF context and previous conversation to provide relevant answers.

---

## 🚀 Features

- 📄 Upload PDF documents
- 💬 Chat with uploaded PDFs
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔎 Semantic search using vector embeddings
- 🗄️ Qdrant vector database for storing PDF embeddings
- 💾 MongoDB for storing chats and messages
- 🔐 Separate PDF context for each chat
- 🧠 Conversation history for contextual follow-up questions
- 📑 PDF text extraction and chunking
- ⚡ React-based responsive chat interface
- 📋 Copy AI responses
- 👍 Like / dislike responses
- 📱 Responsive sidebar with multiple chats
- ☁️ Deployed frontend and backend

---

## 🧠 How It Works

DocuChat AI uses a Retrieval-Augmented Generation (RAG) architecture.

### PDF Upload Flow

```text
User uploads PDF
        ↓
Node.js / Express backend
        ↓
Extract text from PDF
        ↓
Split text into smaller chunks
        ↓
Generate embeddings
        ↓
Store embeddings in Qdrant
        ↓
Store chat information in MongoDB
```

### Question Answering Flow

```text
User asks a question
        ↓
Generate embedding for the question
        ↓
Search Qdrant
        ↓
Filter results using chatId
        ↓
Retrieve relevant PDF chunks
        ↓
Retrieve previous conversation
        ↓
Send context + conversation + question to Gemini
        ↓
Generate answer
        ↓
Store conversation in MongoDB
        ↓
Display answer to user
```

---

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │   React Client  │
                    │                 │
                    │  Chat Interface │
                    └────────┬────────┘
                             │
                             │ HTTP
                             ↓
                    ┌─────────────────┐
                    │ Node.js/Express │
                    │    Backend      │
                    └───────┬─┬───────┘
                            │ │
               ┌────────────┘ └────────────┐
               ↓                           ↓
       ┌────────────────┐          ┌────────────────┐
       │    MongoDB     │          │     Qdrant     │
       │                │          │                │
       │ Chats          │          │ PDF Chunks     │
       │ Messages       │          │ Embeddings     │
       └────────────────┘          └───────┬────────┘
                                           │
                                           ↓
                                  ┌─────────────────┐
                                  │  Google Gemini  │
                                  │                 │
                                  │ Embeddings +    │
                                  │ Answer          │
                                  └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- CSS Modules
- React Icons

### Backend

- Node.js
- Express.js
- Multer
- LangChain
- PDF document loaders

### AI / RAG

- Google Gemini
- Gemini Embeddings
- Retrieval-Augmented Generation (RAG)
- Semantic similarity search

### Databases

- MongoDB
- Qdrant

### Deployment

- Render
- Netlify

---

## 📂 Project Structure

```text
DocuChat-AI/
│
├── Backend/
│   ├── Config/
│   │   └── db.js
│   │
│   ├── Controllers/
│   │   ├── chatControllers.js
│   │   └── pdfControllers.js
│   │
│   ├── Middleware/
│   │   └── multer.js
│   │
│   ├── Model/
│   │   ├── chat.js
│   │   └── message.js
│   │
│   ├── Routers/
│   │   ├── chatRouters.js
│   │   └── pdfRouters.js
│   │
│   ├── Services/
│   │   ├── createCollection.js
│   │   └── qdrant.js
│   │
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Chat.jsx
│   │   │   ├── ChatItem.jsx
│   │   │   ├── Message.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── Style/
│   │   │   ├── chat.module.css
│   │   │   └── message.module.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 💡 Chat-Based Document Isolation

One of the key features of DocuChat AI is that every chat has its own PDF.

For example:

```text
Chat A
 └── NodeJS.pdf

Chat B
 └── React.pdf

Chat C
 └── Java.pdf
```

Each PDF chunk stored in Qdrant contains its corresponding `chatId`.

When a question is asked, Qdrant searches only within that chat:

```text
User Question
      ↓
Query Embedding
      ↓
Qdrant
      ↓
Filter: chatId = current chat
      ↓
Relevant PDF chunks
```

This prevents information from one PDF being accidentally used while chatting with another PDF.

---

## 🧠 Conversation Memory

The chatbot maintains conversation history for each chat.

For example:

```text
User:
What is Node.js?

AI:
Node.js is a JavaScript runtime...

User:
Explain that in detail.

AI:
Node.js is a JavaScript runtime built on...
```

Previous messages are retrieved from MongoDB and provided to the model along with the relevant PDF context.

This allows the chatbot to understand references such as:

- "Explain that"
- "What about this?"
- "Tell me more"
- "Why is it used?"
- "Give me an example"

---

## ⚙️ Environment Variables

Create a `.env` file inside the `Backend` directory:

```env
GOOGLE_API_KEY=your_google_api_key
MONGODB_URI=your_mongodb_connection_string
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
```

For the frontend:

```env
VITE_API_URL=your_backend_url
```

⚠️ Never commit `.env` files or API keys to GitHub.

---

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### Backend

```bash
cd Backend
npm install
```

Create your `.env` file and add the required environment variables.

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd Frontend
npm install
```

Create the frontend `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

---

## ⚠️ Current Limitations

This project currently uses free-tier AI services, so there may be limitations related to:

- API request quotas
- Embedding generation limits
- Rate limits
- PDF processing time
- Large PDF processing

For the best experience, upload smaller PDFs.

The application is designed as a learning/portfolio project and uses external AI and vector database services.

---

## 🔮 Future Improvements

- [ ] Streaming AI responses
- [ ] Source/page references for answers
- [ ] Drag-and-drop PDF upload
- [ ] PDF preview
- [ ] Delete chats
- [ ] Better error handling and retry mechanisms
- [ ] Authentication and user accounts
- [ ] Support for multiple documents per chat
- [ ] Conversation summarization for long chats
- [ ] Improved rate-limit handling
- [ ] Production-grade file storage

---

## 🎯 What I Learned

Through this project, I worked with:

- Full-stack MERN development
- REST API development
- PDF processing
- Text chunking
- Vector embeddings
- Vector databases
- RAG architecture
- Semantic search
- LLM integration
- Conversation memory
- MongoDB data modeling
- Deployment
- Environment variable management

---

## 👩‍💻 Author

**Tanmai**

Built as a full-stack AI/RAG portfolio project.

---

## ⭐ If you found this project useful

Feel free to star the repository and explore the code!
