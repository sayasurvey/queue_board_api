import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET_KEY || "";
const prisma = new PrismaClient();

// JWTのデコードとユーザー確認を行うミドルウェア
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication is required' });
    }

    const decode = await tokenDecode(token);
    const { email } = decode
    
    if (!decode) {
      return res.status(401).json({ message: 'The token is invalid' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

  } catch (error) {
    return res.status(500).json({ message: 'The token verification failed' });
  }
  next();
};

const tokenDecode = async (token: string): Promise<JwtPayload> => {
  const decodedToken = await jwt.verify(token, jwtSecret) as JwtPayload;
  return decodedToken;
};

export = authenticateUser;