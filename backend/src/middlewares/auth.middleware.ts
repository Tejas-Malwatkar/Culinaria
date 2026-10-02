import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      userId: string;
    };

    req.userId = decoded.userId;

    // Fetch user role for authorization checks
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (user) {
      req.userRole = user.role;
    }

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET as string) as {
        userId: string;
      };
      req.userId = decoded.userId;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { role: true },
      });

      if (user) {
        req.userRole = user.role;
      }
    } catch {
      // ignore invalid token
    }
  }

  next();
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

