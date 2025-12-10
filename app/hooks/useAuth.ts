import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { tokenService, userService, type User } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = tokenService.getToken();
      const storedUser = userService.getUser();

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent;

      tokenService.removeToken();
      userService.clearUser();
      setUser(null);
      setIsAuthenticated(false);

      navigate("/login?sessionExpired=true");
    };

    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [navigate]);

  const logout = () => {
    tokenService.removeToken();
    userService.clearUser();
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    isGuru: userService.isGuru(),
    isSiswa: userService.isSiswa(),
  };
}
