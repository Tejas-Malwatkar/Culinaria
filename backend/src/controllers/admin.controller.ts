import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

export const getStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId as string;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updated = await adminService.updateUserRole(userId, role);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId as string;
    await adminService.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getRecipes = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recipes = await adminService.getAllAdminRecipes();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const category = await adminService.createCategory(name);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    await adminService.deleteCategory(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

