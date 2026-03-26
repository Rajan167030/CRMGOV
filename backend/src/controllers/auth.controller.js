import {
  getAuthenticatedUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const result = await registerUser({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

export const meController = async (req, res, next) => {
  try {
    const user = await getAuthenticatedUser(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
  }
};
