import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// A JWT has three parts separated by dots: header.payload.signature
// The "signature" is what makes it trustworthy -- it's created using a
// secret key that only OUR server knows. Anyone can read the payload
// (don't put passwords in it!), but only our server can create a
// signature that will pass verification. If someone tampers with the
// payload, the signature won't match anymore and verify() will throw.

// Access token: short-lived, sent on every authenticated request.
export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtAccessSecret, { expiresIn: "15m" });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret); // throws if invalid/expired
}

// Refresh token: longer-lived, only used to mint a new access token.
export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtRefreshSecret, { expiresIn: "30d" });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
