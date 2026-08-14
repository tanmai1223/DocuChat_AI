import { useEffect, useRef, useState } from "react";
import {
  FiMessageSquare,
  FiMoreHorizontal,
  FiEdit,
} from "react-icons/fi";

import style from "../Style/chat.module.css";

function ChatItem({ chat, onSelectChat, renameChat}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);

  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setTitle(chat.title);
  }, [chat.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const saveTitle = async () => {
    const newTitle = title.trim();

    if (newTitle && newTitle !== chat.title) {
      await renameChat(chat._id, newTitle);
    }

    setEditing(false);
  };

  return (
    <li
      className={style.chatItem}
      onClick={() => {
        if (!editing) {
          onSelectChat(chat._id);
        }
      }}
    >
      <div className={style.chatLeft}>
        <FiMessageSquare />

        {editing ? (
          <input
            ref={inputRef}
            className={style.renameInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.target.blur();
              }

              if (e.key === "Escape") {
                setEditing(false);
              }
            }}
          />
        ) : (
          <span>{chat.title}</span>
        )}
      </div>

      <div className={style.menuWrapper} ref={menuRef}>
        <button
          className={style.moreBtn}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu(!openMenu);
          }}
        >
          <FiMoreHorizontal />
        </button>

        {openMenu && (
          <div className={style.dropdown}>
            <button
              onClick={(e) => {
                e.stopPropagation();

                setEditing(true);
                setOpenMenu(false);
              }}
            >
              <FiEdit />
              Rename
            </button>

          </div>
        )}
      </div>
    </li>
  );
}

export default ChatItem;
