import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// TODO: Remove this mock object. In a production environment, user data will be returned 
// by the backend API and decoded from a secure JWT session cookie or token.
const MOCK_USERS = {
  admin: {
    id: "GOV-ADM-0001",
    name: "Admin Central",
    email: "admin@pscrm.gov.in",
    phone: "+91 98765 00000",
    role: "admin",
    avatar: "AC",
    department: "All Departments",
    designation: "Superadmin",
  },
  user: {
    id: "CIT-USR-4521",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@gmail.com",
    phone: "+91 98765 43210",
    role: "user",
    avatar: "RK",
    department: null,
    designation: "Citizen",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user'

  const login = (selectedRole) => {
    // TODO: Replace with `await axios.post('/api/auth/login', { credentials })`
    // Then set the resulting JWT token in secure HTTP-only cookies or local storage
    const mockUser = MOCK_USERS[selectedRole];
    setUser(mockUser);
    setRole(selectedRole);
  };

  const logout = () => {
    // TODO: Add backend API call: `await axios.post('/api/auth/logout')`
    // Ensure all local tokens/sessions are cleared from context and storage
    setUser(null);
    setRole(null);
  };

  const switchRole = () => {
    const newRole = role === "admin" ? "user" : "admin";
    login(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, switchRole, isAdmin: role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
