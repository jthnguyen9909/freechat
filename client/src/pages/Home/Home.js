import MenuAppBar from "../../components/appBar/";
import LogoutButton from "../../components/logoutButton/";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import DrawerComp from "../../components/drawerComp/";
import ChatBox from "../../components/chatBox/";
import axios from "axios";

export default function Home({ onHome, session, username }) {
  useEffect(() => {
    axios
      .get("/api/users/sessiondata")
      .then((response) => {
        onHome(response.data.sessionData);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [onHome]);
  return (
    <>
      {/* <MenuAppBar>test</MenuAppBar> */}
      <ChatBox username={username} />
      {username ? (
        <LogoutButton>logout</LogoutButton>
      ) : (
        <>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </>
      )}

      {username ? (
        <Link to="/game">
          <button>Play</button>
        </Link>
      ) : null}
    </>
  );
}
