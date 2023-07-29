import React, { useEffect } from "react";
// import { Link } from "react-router-dom";
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
      <ChatBox username={username} />
    </>
  );
}
