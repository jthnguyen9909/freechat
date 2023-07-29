import style from "./chatBox.module.css";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import LogoutButton from "../logoutButton";
import { format } from "date-fns";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

const { io } = require("socket.io-client");
const socket = io("http://localhost:3000/");

export default function ChatBox({ username }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [formState, setFormState] = useState({});

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  socket.on("message", (message, user) => {
    serverMessage(message, user);
  });

  // keeps running twice, WIP
  useEffect(() => {
    socket.on("joinMessage", serverMessage);
    return () => socket.off("joinMessage", serverMessage);
  });

  useEffect(() => {
    socket.emit("userJoinMessage", username);
    socket.emit("userJoin", username);
  }, [username]);

  useEffect(() => {
    socket.on("userUpdate", (chatUsers) => {
      const arrayUsers = chatUsers.map((user) => user.username);
      setUsers(arrayUsers);
    });
  }, [users]);

  const getCurrentFormattedDate = () => {
    const currentDate = new Date();
    const formattedTime = format(currentDate, "hh:mm a");
    return formattedTime;
  };
  const formattedTime = getCurrentFormattedDate();

  const serverMessage = (message, user) => {
    const newMessage = (
      <div className="message" key={Date.now()}>
        <p className="meta">
          {formattedTime} <span>{user}</span>
        </p>
        <p className="text">{message}</p>
      </div>
    );
    setMessages([...messages, newMessage]);
  };

  const handleInputChange = (event) => {
    setFormState(event.target.value);
  };

  // submit message
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const msg = formState;
    if (username) {
      // emitting a message to server
      socket.emit("chatMessage", msg, username);
    } else {
      const loginMessage = (
        <div className="message" key={Date.now()}>
          <p className={style.loginMsg}>
            Please login or sign up to begin chatting!
          </p>
        </div>
      );
      setMessages([...messages, loginMessage]);
    }
  };

  return (
    <>
      <div className={style.chatContainer}>
        <header className={style.chatHeader}>
          <h1>
            <Link to="/">ChatHub</Link>
          </h1>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {!username ? (
                <div>
                  <MenuItem onClick={handleClose}>
                    <Link className={style.menuText} to="login">
                      Login
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Link className={style.menuText} to="signup">
                      Sign Up
                    </Link>
                  </MenuItem>
                </div>
              ) : (
                <div>
                  <MenuItem onClick={handleClose}>
                    <LogoutButton>Logout</LogoutButton>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Link className={style.menuText} to="/game">
                      Play Snake
                    </Link>
                  </MenuItem>
                </div>
              )}
            </Menu>
          </div>
        </header>
        <main className={style.chatMain}>
          <div className={style.chatSidebar}>
            <h3>Users</h3>
            <ul id="users">
              <li>Brad</li>
              <li>John</li>
              <li>Mary</li>
              {!username ? <li>You (Anonymous)</li> : null}
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
          <div className={style.chatMessages}>
            <div className="message">
              <p className="meta">
                9:15 PM <span>Mary</span>
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
            <button className="btn">
              <SendRoundedIcon className={style.sendIcon} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
