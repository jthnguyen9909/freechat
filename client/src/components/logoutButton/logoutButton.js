import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import style from "./logoutButton.module.css";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async function () {
    console.log("logout called");
    const response = await fetch("/api/users/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate("/");
      window.location.reload();
      console.log("logout success");
    } else {
      alert("Failed to log out");
    }
  };

  return (
    <>
      <Link className={style.menuText} onClick={handleLogout}>
        Logout
      </Link>
    </>
  );
}
