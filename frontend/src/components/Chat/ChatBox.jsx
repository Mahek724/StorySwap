import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import "../Chat/ChatBox.css";
import { FaPaperPlane } from "react-icons/fa";

const ChatBox = ({ bookId, lenderId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, "chats", bookId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [bookId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "chats", bookId, "messages"), {
        senderId: currentUser.uid,
        receiverId: lenderId,
        message,
        timestamp: new Date(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toDate = (timestamp) => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp.toDate instanceof Function) return timestamp.toDate();
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      return new Date(timestamp);
    }
    return new Date();
  };

  const getTimeLabel = (timestamp) => {
    const date = toDate(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getFullDateTimeLabel = (timestamp) => {
    const date = toDate(timestamp);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(/,/, "");
  };

  const shouldShowDateOnHover = (timestamp) => {
    const date = toDate(timestamp);
    const today = new Date();
    return date.getDate() !== today.getDate() || date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with Lender</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble ${
              msg.senderId === currentUser.uid ? "sent" : "received"
            }`}
            title={shouldShowDateOnHover(msg.timestamp) ? getFullDateTimeLabel(msg.timestamp) : ""}
          >
            <span className="message-content">{msg.message}</span>
            <span className="message-time">{getTimeLabel(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="chat-input-field"
        />
        <button type="submit" className="send-btn">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;