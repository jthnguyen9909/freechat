import style from "./chatBox.module.css";
// import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
const { io } = require("socket.io-client");
const socket = io("http://localhost:3000/");

export default function ChatBox({ username }) {
  const [formState, setFormState] = useState({});

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   socket.on("message", (message) => {
  //     console.log(message);
  //     serverMessage(message);
  //   });
  //   return () => socket.off("message");
  // });

  socket.on("message", (message) => {
    // console.log(message);
    serverMessage(message);
  });

  // keeps running twice, WIP
  useEffect(() => {
    socket.on("joinMessage", serverMessage);
    return () => socket.off("joinMessage", serverMessage);
  });

  useEffect(() => {
    socket.emit("userJoinMessage", username);
    socket.emit("userJoin", username);
    // console.log("userjoin emitted");
  }, [username]);

  useEffect(() => {
    socket.on("userUpdate", (chatUsers) => {
      setUsers(chatUsers);
      console.log(users);
    });
  }, [users]);

  const handleTest = () => {
    console.log(users);
  };

  const serverMessage = (message) => {
    const newMessage = (
      <div className="message" key={Date.now()}>
        <p className="meta">
          John <span>9:12pm</span>
        </p>
        <p className="text">{message}</p>
      </div>
    );
    setMessages([...messages, newMessage]);
    // console.log(messages);
  };

  const handleInputChange = (event) => {
    setFormState(event.target.value);
  };

  // submit message
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const msg = formState;

    // emitting a message to server
    socket.emit("chatMessage", msg);
  };

  return (
    <>
      <div className={style.chatContainer}>
        <header className={style.chatHeader}>
          <h1>
            <i className="fas fa-smile"></i> ChatHub
          </h1>
          {/* <a href="index.html" className="btn">
            Leave Room
          </a> */}
        </header>
        <main className={style.chatMain}>
          <div className={style.chatSidebar}>
            {/* <h3>
              <i className="fas fa-comments"></i> Room Name:
            </h3>
            <h2 id="room-name">JavaScript</h2> */}
            <h3>
              <i className="fas fa-users"></i> Users
            </h3>
            <ul id="users">
              <li>Brad</li>
              <li>John</li>
              <li>Mary</li>
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
          <div className={style.chatMessages}>
            <div className="message">
              <p className="meta">
                Mary <span>9:15pm</span>
              </p>
              <p className="text">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, repudiandae.
              </p>
            </div>
            <div>{messages}</div>
          </div>
        </main>
        <div className={style.chatFormContainer}>
          <form id="chatForm" onSubmit={handleFormSubmit}>
            <input
              id="msg"
              type="text"
              placeholder="Enter Message"
              required
              autoComplete="off"
              value={formState.username}
              onChange={handleInputChange}
            />
            {/* <button className="btn" onClick={addMessage}> */}
            <button className="btn">
              <i className="fas fa-paper-plane"></i> Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
