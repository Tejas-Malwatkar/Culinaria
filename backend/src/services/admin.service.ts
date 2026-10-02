import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export const getSystemStats = async () => {
  const [totalUsers, totalRecipes, totalCategories, totalReviews, totalLikes] =
    await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.category.count(),
      prisma.review.count(),
      prisma.like.count(),
    ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      avatarUrl: true,
    },
  });

  const recentRecipes = await prisma.recipe.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return {
    totalUsers,
    totalRecipes,
    totalCategories,
    totalReviews,
    totalLikes,
    recentUsers,
    recentRecipes,
  };
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          recipes: true,
          reviews: true,
          likes: true,
        },
      },
    },
  });
};

export const updateUserRole = async (userId: string, role: 'USER' | 'ADMIN') => {
  return prisma.user.update({
    where: { id: userId },
    data: { role: role as Role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

export const deleteUser = async (userId: string) => {
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { userId } }),
    prisma.like.deleteMany({ where: { userId } }),
    prisma.ingredient.deleteMany({
      where: { recipe: { authorId: userId } },
    }),
    prisma.instruction.deleteMany({
      where: { recipe: { authorId: userId } },
    }),
    prisma.recipe.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
};

export const getAllAdminRecipes = async () => {
  return prisma.recipe.findMany({
    include: {
      category: true,
      author: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { likes: true, reviews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createCategory = async (name: string) => {
  return prisma.category.create({
    data: { name: name.trim() },
  });
};

export const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: { id },
  });
};
