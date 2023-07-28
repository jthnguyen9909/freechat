import { useNavigate } from "react-router-dom";

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
      console.log("logout success");
    } else {
      alert("Failed to log out");
    }
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
