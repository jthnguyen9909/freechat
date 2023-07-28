import { useState } from "react";

import style from "./login.module.css";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
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

    const response = await fetch("api/users/login", {
      method: "POST",
      body: JSON.stringify({
        username: formState.username,
        password: formState.password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    console.log(formState.username, formState.password);

    if (response.ok) {
      // document.location.replace("/");
      navigate("/");
      console.log("login success");
    } else {
      alert("Failed to login");
    }

    // try {
    //   const { data } = await Login({
    //     variables: { ...formState },
    //   });
    //   Auth.login(data.login.token);
    // } catch (err) {
    //   console.error(err);
    // }
  };

  return (
    <>
      <h1 className={style.title}>Login</h1>

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
            Login
          </button>
        </span>
        <div className={style.alternativeOptionSection}>
          <h4 className={style.altEl}>Don't have an account yet?</h4>
          <Link to="/signup">
            <button className={style.signUpBtn}>Sign Up</button>
          </Link>
        </div>
      </form>
    </>
  );
}
