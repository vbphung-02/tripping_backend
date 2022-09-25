import { Router } from "express";

import { failedResponse, successResponse } from "../models/MyResponse";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/token";
import { loginValidate, signupValidate } from "../utils/validators/auth";

const authRoute = Router();

authRoute.post("/signup", async (req, res) => {
  console.log("[tripping] signup:", req.body);

  const { error } = signupValidate(req.body);
  if (error) {
    return res.status(400).json(failedResponse(error.message));
  }

  try {
    const user = new User({
      name: req.body["name"],
      email: req.body["email"],
      password: await hashPassword(req.body["password"]),
    });

    await user.save();

    res.json(successResponse(user));
  } catch (err: any) {
    res.status(500).json(failedResponse(err["message"]));
  }
});

authRoute.post("/login", async (req, res) => {
  console.log("[tripping] login:", req.body);

  const { error } = loginValidate(req.body);
  if (error) {
    return res.status(400).json(failedResponse(error.message));
  }

  const accExists = await User.findOne({ email: req.body["email"] });
  if (!accExists) {
    return res.status(400).json(failedResponse("Non-existent Account"));
  }

  const checkPw = await checkPassword(req.body["password"], accExists.password);
  if (!checkPw) {
    return res.status(400).json(failedResponse("Incorrect Password"));
  }

  const tk = generateToken(accExists.toObject());

  res.json(successResponse({ token: tk }));
});

export default authRoute;
