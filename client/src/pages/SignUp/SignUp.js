import style from "./signup.module.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
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
      <h1 className={style.title}>Sign Up</h1>

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
          <button className={style.loginBtn} type="submit">
            Sign Up
          </button>
        </span>
        <div className={style.alternativeOptionSection}>
          <h4 className={style.altEl}>Already have an account?</h4>
          <Link to="/login">
            <button className={style.signUpBtn}>Login</button>
          </Link>
        </div>
      </form>
    </>
  );
}
