import style from "./signup.module.css";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import LogoutButton from "../../components/logoutButton";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

export default function SignUp({ username }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [formState, setFormState] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = ({ target: { name, value } }) => {
    setFormState({ ...formState, [name]: value });
  };

  const navigate = useNavigate();

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: formState.username,
        password: formState.password,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate("/");
    } else {
      alert("Sign Up failed.");
    }
  };
  return (
    <>
      <div className={style.chatContainer}>
        <header className={style.chatHeader}>
          <h1>
            <Link to="/">Sign Up</Link>
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
              <div>
                <MenuItem onClick={handleClose}>
                  <Link className={style.menuText} to="/">
                    Home
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Link className={style.menuText} to="login">
                    Login
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <LogoutButton>Logout</LogoutButton>
                </MenuItem>
              </div>
            </Menu>
          </div>
        </header>
        <main className={style.chatMain}>
          <form className={style.formContainer} onSubmit={handleFormSubmit}>
            <input
              className={style.inputField}
              type="text"
              autoComplete="off"
              name="username"
              value={formState.username}
              onChange={handleInputChange}
              placeholder="Enter Username"
            />

            <input
              className={style.inputField}
              type="password"
              name="password"
              value={formState.password}
              onChange={handleInputChange}
              placeholder="Password"
            />
            <span className={style.btnContainer}>
              <button className={style.btn} type="submit">
                Sign Up
              </button>
            </span>
            <div className={style.alternativeOptionSection}>
              <h4 className={style.altEl}>Don't have an account yet?</h4>
              <Link to="/login">
                <button className={style.btn}>Login</button>
              </Link>
            </div>
          </form>
        </main>
        <div className={style.footer}></div>
      </div>
    </>
  );
}
