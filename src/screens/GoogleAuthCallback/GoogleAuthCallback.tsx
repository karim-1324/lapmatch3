import { JSX, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const GoogleAuthCallback = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("user_id");
    const email = params.get("email");
    const username = params.get("username");

    if (token && userId) {
      const user = {
        id: parseInt(userId, 10),
        email: email || "",
        username: username || "",
      };
            localStorage.setItem('authMethod', 'google');
      
      login(token, user);
      
      navigate("/");
    } else {
      navigate("/login?error=Authentication failed");
    }
  }, [location, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
        <p>Please wait while we complete your login.</p>
      </div>
    </div>
  );
};