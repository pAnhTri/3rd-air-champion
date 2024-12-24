import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_TOKEN =
  process.env.SECRET_TOKEN ||
  "509ea5f1fd64b855c9c372453b8f114593d1aabdb02653e880b4432f661d0eaee73bc06d631064b0ec8c0ecb4b77656b4fa0390dc0805812c365a7f15891efa1";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader)
    return res.status(401).json({ error: "Authorization token missing" });

  const token = authorizationHeader.split(" ")[1]; // Bearer <token>

  jwt.verify(token, SECRET_TOKEN, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    (req as any).user = decoded;
    return next();
  });
};
