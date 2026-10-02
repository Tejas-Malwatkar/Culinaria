import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getRecipes,
  createCategory,
  deleteCategory,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

router.get('/recipes', getRecipes);

router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
