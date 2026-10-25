import React, { createContext, useContext, useState, useEffect } from "react";
import { User, MOCK_USERS } from "./data/mockDb";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message?: string; role?: string };
  logout: () => void;
  updateUser?: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load saved user from browser storage on startup (supports both keys)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("currentUser") || localStorage.getItem("current_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    }
  }, []);

  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check custom dynamically registered users if present
    let dynamicUsers: User[] = [];
    try {
      const customUsersJson = localStorage.getItem("equitransit_registered_users");
      if (customUsersJson) {
        dynamicUsers = JSON.parse(customUsersJson);
      }
    } catch {
      dynamicUsers = [];
    }

    const allUsers = [...dynamicUsers, ...MOCK_USERS];
    const foundUser = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && (u as any).password === password
    );

    if (foundUser) {
      const { password: _, ...safeUser } = foundUser as any;
      
      setCurrentUser(safeUser as User);
      // Synchronize both keys to guarantee compatibility across all admin and passenger screens
      localStorage.setItem("currentUser", JSON.stringify(safeUser));
      localStorage.setItem("current_user", JSON.stringify(safeUser));

      return { success: true, role: foundUser.role };
    } else {
      return { success: false, message: "Invalid email or password for this portal." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("current_user");
    localStorage.removeItem("pending_ticket_booking");
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    localStorage.setItem("current_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};