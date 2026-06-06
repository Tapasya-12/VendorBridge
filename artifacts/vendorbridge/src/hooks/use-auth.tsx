import { useState, useEffect } from "react";
import { User } from "@workspace/api-client-react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("vb_user");
      const storedToken = localStorage.getItem("vb_token");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: User, newToken: string) => {
    localStorage.setItem("vb_user", JSON.stringify(newUser));
    localStorage.setItem("vb_token", newToken);
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("vb_user");
    localStorage.removeItem("vb_token");
    setUser(null);
    setToken(null);
  };

  return {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };
}