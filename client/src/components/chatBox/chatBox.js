import style from "./chatBox.module.css";
import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import LogoutButton from "../logoutButton";
import { format } from "date-fns";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

const { io } = require("socket.io-client");
const socket = io("http://localhost:3000/");
const Filter = require("bad-words");
const filter = new Filter();

export default function ChatBox({ username }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const inputRef = useRef(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [formState, setFormState] = useState("");

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  socket.on("message", (message, user) => {
    serverMessage(message, user);
  });

  socket.on("whisperReceive", (message, user) => {
    whisperMessage(message, user);
  });

  socket.on("whisperError", (message) => {
    const whisperErrorMessage = (
      <div className={style.message} key={Date.now()}>
        <p className={style.meta}>
          {formattedTime} <span className={style.serverMsg}>Server</span>
        </p>
        <p className={style.loginMsg}>{message}</p>
      </div>
    );
    setMessages([...messages, whisperErrorMessage]);
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

  const handleWhisper = (e) => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setFormState(`/w ${e.target.innerHTML} `);
    inputRef.current.focus();
  };

  const getCurrentFormattedDate = () => {
    const currentDate = new Date();
    const formattedTime = format(currentDate, "hh:mm a");
    return formattedTime;
  };
  const formattedTime = getCurrentFormattedDate();

  const whisperMessage = (message, user) => {
    const newMessage = (
      <div className={style.message} key={Date.now()}>
        <p className={style.meta}>
          {formattedTime} <span>{user}</span>
        </p>
        <p className={style.whisper}>{message}</p>
      </div>
    );
    setMessages([...messages, newMessage]);
  };

  const serverMessage = (message, user) => {
    const newMessage = (
      <div className={style.message} key={Date.now()}>
        <p className={style.meta}>
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
    // censors profanity, but messages still sent
    const msg = filter.clean(formState);
    // completely disallows messages with profanity from being sent
    // if (filter.isProfane(msg)) {
    //   const profanityMessage = (
    //     <div className={style.message} key={Date.now()}>
    //       <p className={style.loginMsg}>Profanity is not allowed.</p>
    //     </div>
    //   );
    //   setMessages([...messages, profanityMessage]);
    //   return;
    // }
    if (username) {
      // check if user runs the whisper command; if so, split username and message content
      if (msg.startsWith("/w ")) {
        const whisperMessage = msg.slice(3);
        const [username, ...messageParts] = whisperMessage.split(" ");
        const whisperRecipient = username.trim();
        const whisperContent = messageParts.join(" ").trim();
        socket.emit(
          "whisperMessage",
          whisperRecipient,
          whisperContent,
          username
        );
        setFormState(`/w ${whisperRecipient} `);
      } else {
        // emitting a message to server if not whisper
        socket.emit("chatMessage", msg, username);
        setFormState("");
      }
    } else {
      // give error message to login if not logged in
      const loginMessage = (
        <div className={style.message} key={Date.now()}>
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
            <Link to="/">FreeChat</Link>
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
              {/* <li className={style.user} onClick={handleWhisper}>
                Brad
              </li>
              <li className={style.user} onClick={handleWhisper}>
                John
              </li>
              <li className={style.user} onClick={handleWhisper}>
                Mary
              </li> */}
              {!username ? <li>You (Anonymous)</li> : null}
              {users.map((user, index) => (
                <li className={style.user} onClick={handleWhisper} key={index}>
                  {user}
                </li>
              ))}
            </ul>
          </div>
          <div className={style.chatMessages}>
            {/* <div className={style.message}>
              <p className={style.meta}>
                9:15 PM <span>Mary</span>
              </p>
              <p className="text">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, repudiandae.
              </p>
            </div> */}
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
              value={formState}
              onChange={handleInputChange}
              ref={inputRef}
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
