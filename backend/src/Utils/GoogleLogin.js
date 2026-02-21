import crypto from "crypto";
import asyncHandler from "../Utils/AsyncHandler.js";
import User from "../Schemas/UserSchema.js";
import { CreateAccessToken, CreateRefreshToken } from "../Utils/Authutils.js";

const GoogleLogin = asyncHandler(async (req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 1000,
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  res.redirect(url.toString());
});

const GoogleLoginProvider = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies.google_oauth_state;

  if (!code || !state || state !== storedState) {
    return res.status(400).send("Invalid OAuth state");
  }

  res.clearCookie("google_oauth_state");

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=token_failed`);
  }

  const { access_token } = await tokenRes.json();
  if (!access_token) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=no_token`);
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=userinfo_failed`);
  }

  const gUser = await userRes.json();
  const email = gUser.email.toLowerCase();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      fullname: gUser.name || email.split("@")[0],
      password: crypto.randomBytes(32).toString("hex"),
    });
  }

  const accessToken = CreateAccessToken(user._id, user.email, user.fullname, user.role);
  const refreshToken = CreateRefreshToken(user._id, user.email, user.fullname, user.role);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  // Redirect to frontend dashboard
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`);
});

export { GoogleLogin, GoogleLoginProvider };
