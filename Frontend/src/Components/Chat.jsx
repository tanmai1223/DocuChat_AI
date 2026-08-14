import { useEffect, useRef, useState } from "react";
import style from "../Style/chat.module.css";
import Message from "./Message";
import Sidebar from "./Sidebar";
import { FiMenu } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

function Chat() {
  const [chat, setChat] = useState("");
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  // Fetch messages
  const fetchMessages = async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/messages/${id}`);
      const data = await res.json();
      setMessages(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chats`);
      const data = await res.json();
      setChats(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Load last opened chat
  useEffect(() => {
    const savedChatId = sessionStorage.getItem("chatId");
    if (savedChatId) {
      setChatId(savedChatId);
    }
  }, []);

  // Whenever chat changes, load its messages
  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chat.trim()) return;

    if (!chatId) {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          role: "assistant",
          text: "Please upload a PDF before asking questions.",
        },
      ]);
      return;
    }

    const userText = chat;

    setChat("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "58px";
    }

    setLoading(true);

    const userMessage = {
      _id: Date.now(),
      role: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatId,
          query: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now() + 1,
          role: "assistant",
          text: data.answer,
        },
      ]);

      // Sync messages with MongoDB
      await fetchMessages(chatId);
    } catch (err) {
      console.error(err);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.name === "TypeError") {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection or try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now() + 2,
          role: "assistant",
          text: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    sessionStorage.removeItem("chatId");
    setChatId(null);
    setMessages([]);
    setChat("");

    // Close sidebar on mobile
    setSidebarOpen(false);

    await fetchChats();
  };

  const handleSelectChat = (id) => {
    setChatId(id);
    sessionStorage.setItem("chatId", id);
  };

  const renameChat = async (id, title) => {
    try {
      const res = await fetch(`${API_URL}/api/rename/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (!res.ok) return;

      setChats((prev) =>
        prev.map((chat) => (chat._id === id ? { ...chat, title } : chat)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          role: "assistant",
          text: "⚠️ Please upload a PDF file.",
        },
      ]);

      e.target.value = "";
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      if (chatId) {
        formData.append("chatId", chatId);
      }

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "PDF upload failed.");
      }

      const newChatId = data.chatId;

      // Save current chat
      setChatId(newChatId);
      sessionStorage.setItem("chatId", newChatId);

      // Refresh sidebar
      await fetchChats();

      // Load PDF upload messages from MongoDB
      await fetchMessages(newChatId);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          role: "assistant",
          text: `⚠️ ${err.message || "Failed to upload PDF."}`,
        },
      ]);
    } finally {
      setLoading(false);
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={style.container}>
      <Sidebar
        chats={chats}
        handleNewChat={handleNewChat}
        onSelectChat={(id) => {
          handleSelectChat(id);
          setSidebarOpen(false);
        }}
        renameChat={renameChat}
        sidebarOpen={sidebarOpen}
      />
      {sidebarOpen && (
        <div className={style.overlay} onClick={() => setSidebarOpen(false)} />
      )}
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleUploadPDF}
        style={{ display: "none" }}
      />
      <main className={style.main}>
        <div className={style.header}>
          <button
            className={style.menuBtn}
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu />
          </button>

          <h2>DocuChat AI</h2>
        </div>
        <div className={style.messages}>
          <Message
            messages={messages}
            isTyping={loading}
            uploading={uploading}
            onUploadPDF={() => fileInputRef.current?.click()}
          />
        </div>

        <form className={style.inputArea}>
          <textarea
            ref={textareaRef}
            value={chat}
            onChange={(e) => {
              setChat(e.target.value);

              // Auto-grow
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask anything..."
            rows={1}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!chat.trim() || loading}
          >
            {uploading ? "Uploading..." : loading ? "Generating..." : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Chat;
