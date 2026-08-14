import { FiEdit2 } from "react-icons/fi";
import style from "../Style/chat.module.css";
import ChatItem from "./ChatItem";
 
function Sidebar({
  chats,
  handleNewChat,
  onSelectChat,
  renameChat,
  onDeleteClick,
  sidebarOpen,
}) {
  return (
    <aside
      className={`${style.sidebar} ${sidebarOpen ? style.showSidebar : ""}`}
    >
      <div className={style.logo}>
        <h2>Chatbot</h2>
      </div>

      <button className={style.newChat} onClick={handleNewChat}>
        <FiEdit2 size={18} />
        <span>New chat</span>
      </button>

      <div className={style.recentSection}>
        <h4>Recents</h4>

        <ul className={style.chatList}>
          {chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              onSelectChat={onSelectChat}
              renameChat={renameChat}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
