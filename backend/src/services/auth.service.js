import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const buildAvatar = (name) =>
  name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  department: user.department,
  designation: user.designation,
  avatar: user.avatar,
});

const signToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    jwtSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const seedDefaultUsers = async () => {
  const defaults = [
    {
      email: process.env.DEFAULT_ADMIN_EMAIL || "admin@pscrm.gov.in",
      password: process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123",
      role: "admin",
      name: process.env.DEFAULT_ADMIN_NAME || "Admin Central",
      phone: process.env.DEFAULT_ADMIN_PHONE || "+91 98765 00000",
      department: "All Departments",
      designation: "Superadmin",
    },
    {
      email: process.env.DEFAULT_USER_EMAIL || "rajesh.kumar@gmail.com",
      password: process.env.DEFAULT_USER_PASSWORD || "User@123",
      role: "user",
      name: process.env.DEFAULT_USER_NAME || "Rajesh Kumar",
      phone: process.env.DEFAULT_USER_PHONE || "+91 98765 43210",
      department: null,
      designation: "Citizen",
    },
  ];

  for (const account of defaults) {
    const existingUser = await User.findOne({ email: account.email.toLowerCase() });

    if (existingUser) {
      continue;
    }

    const passwordHash = await bcrypt.hash(account.password, 10);

    await User.create({
      ...account,
      email: account.email.toLowerCase(),
      password: passwordHash,
      avatar: buildAvatar(account.name),
    });
  }
};

export const registerUser = async ({
  name,
  email,
  password,
  phone,
  role = "user",
}) => {
  if (role === "admin") {
    const error = new Error("Admin accounts must be created by the system administrator");
    error.statusCode = 403;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
    role,
    phone: phone?.trim() || "",
    department: role === "admin" ? "All Departments" : null,
    designation: role === "admin" ? "Government Officer" : "Citizen",
    avatar: buildAvatar(name.trim()),
  });

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
};

export const loginUser = async ({ email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (role && user.role !== role) {
    const error = new Error("This account does not have access to the selected portal");
    error.statusCode = 403;
    throw error;
  }

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
};

export const getAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};
