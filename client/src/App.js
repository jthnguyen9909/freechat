import "./App.css";
import React, { useCallback, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const handleLoginData = useCallback((data) => {
    setSessionData(data);
    setSessionUser(data.username);
  }, []);

  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route
              path="/"
              element={<Home onHome={handleLoginData} username={sessionUser} />}
            />
            <Route path="/game" element={<Game />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
