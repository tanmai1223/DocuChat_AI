import { useEffect, useRef, useState } from "react";
import {
  FiCopy,
  FiCheck,
  FiThumbsUp,
  FiThumbsDown,
  FiUpload
} from "react-icons/fi";

import {
  AiFillLike,
  AiFillDislike,
} from "react-icons/ai";

import style from "../Style/message.module.css";
 
function Message({ messages, isTyping, onUploadPDF }) {
  const bottomRef = useRef(null);

  const [copiedId, setCopiedId] = useState(null);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const copyText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (err) {
      console.log(err);
    }
  };

  

  return (
    <div className={style.chatBody}>
    {messages.length === 0 ? (
      <div className={style.welcome}>
  <button
  className={style.uploadButton}
    className={style.uploadButton}
    onClick={onUploadPDF}
  >
    <FiUpload />
  </button>

  <h2>Upload a PDF</h2>

  <p>Upload a PDF and start asking questions about it.</p>
</div>
    ) : (
      <>
      {messages.map((m) => (
        <div
          key={m._id}
          className={`${style.messageRow} ${
            m.role === "user" ? style.user : style.assistant
          }`}
        >
          {/* Assistant Avatar */}
          {m.role === "assistant" && (
            <div className={style.avatar}>🤖</div>
          )}

          {/* Assistant Message */}
          {m.role === "assistant" ? (
            <div className={style.messageContainer}>
              <div className={style.messageBubble}>
                {m.text}
              </div>

              <div className={style.actionRow}>
                <button
                  className={style.iconBtn}
                  onClick={() => copyText(m._id, m.text)}
                  title="Copy"
                >
                  {copiedId === m._id ? (
                    <FiCheck />
                  ) : (
                    <FiCopy />
                  )}
                </button>

                <button
                  className={style.iconBtn}
                  title="Like"
                  onClick={() =>
                    setFeedback((prev) => ({
                      ...prev,
                      [m._id]:
                        prev[m._id] === "like"
                          ? null
                          : "like",
                    }))
                  }
                >
                  {feedback[m._id] === "like" ? (
                    <AiFillLike />
                  ) : (
                    <FiThumbsUp />
                  )}
                </button>

                <button
                  className={style.iconBtn}
                  title="Dislike"
                  onClick={() =>
                    setFeedback((prev) => ({
                      ...prev,
                      [m._id]:
                        prev[m._id] === "dislike"
                          ? null
                          : "dislike",
                    }))
                  }
                >
                  {feedback[m._id] === "dislike" ? (
                    <AiFillDislike />
                  ) : (
                    <FiThumbsDown />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* User Message */}
              <div className={style.messageBubble}>
                {m.text}
              </div>

              {/* User Avatar */}
              <div className={style.avatar}>👤</div>
            </>
          )}
        </div>
      ))}
      {isTyping && (
  <div className={`${style.messageRow} ${style.assistant}`}>
    <div className={style.avatar}>🤖</div>

    <div className={style.typingBubble}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
)}

    </>
  )}

      <div ref={bottomRef} />
      
   
  </div>
)
}

export default Message;