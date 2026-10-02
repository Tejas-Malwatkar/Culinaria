import 'dotenv/config';
import { PrismaClient, Role, Difficulty } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const dbPath = path.resolve(__dirname, './dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Reset existing data in order
  await prisma.review.deleteMany();
  await prisma.like.deleteMany();
  await prisma.instruction.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const userPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Create Users
  const user = await prisma.user.create({
    data: {
      name: 'Chef Maria',
      email: 'chef@recipes.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      bio: 'Home chef & food blogger passionate about authentic Italian & Mediterranean flavors.',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Master',
      email: 'admin@recipes.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'System Administrator & Culinary Director.',
    },
  });

  console.log('✅ Users created: Chef Maria (USER) & Admin Master (ADMIN)');

  // Categories & Recipes Data
  const categoriesData = [
    {
      name: 'Breakfast',
      recipes: [
        {
          title: 'Fluffy Buttermilk Pancakes',
          description: '<p>Classic golden pancakes served with real maple syrup, fresh berries, and whipped butter.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
          prepTime: 10,
          cookTime: 15,
          servings: 4,
          difficulty: Difficulty.EASY,
          cuisine: 'American',
          dietary: 'Vegetarian',
          tags: 'Pancakes,Breakfast,Sweet',
          ingredients: [
            { name: 'All-Purpose Flour', quantity: '2', unit: 'cups' },
            { name: 'Buttermilk', quantity: '1.5', unit: 'cups' },
            { name: 'Eggs', quantity: '2', unit: 'large' },
            { name: 'Unsalted Butter (Melted)', quantity: '3', unit: 'tbsp' },
            { name: 'Baking Powder', quantity: '2', unit: 'tsp' },
            { name: 'Maple Syrup', quantity: '1/2', unit: 'cup' }
          ],
          instructions: [
            'Whisk flour, sugar, baking powder, and salt together in a large bowl.',
            'In a separate bowl, whisk buttermilk, eggs, and melted butter.',
            'Pour wet ingredients into dry ingredients and gently fold until just combined. Do not overmix!',
            'Heat a buttered skillet over medium heat. Pour 1/4 cup batter per pancake.',
            'Cook until bubbles form on surface, flip and cook 1-2 minutes until golden brown. Serve hot with syrup.'
          ]
        },
        {
          title: 'Avocado & Poached Egg Toast',
          description: '<p>Artisanal sourdough topped with creamy smashed avocado, poached eggs, radish slices, and red pepper flakes.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
          prepTime: 10,
          cookTime: 10,
          servings: 2,
          difficulty: Difficulty.EASY,
          cuisine: 'Continental',
          dietary: 'Vegetarian',
          tags: 'Healthy,Avocado,Toast,Eggs',
          ingredients: [
            { name: 'Sourdough Bread', quantity: '2', unit: 'slices' },
            { name: 'Ripe Avocados', quantity: '1.5', unit: 'whole' },
            { name: 'Fresh Eggs', quantity: '2', unit: 'large' },
            { name: 'Lemon Juice', quantity: '1', unit: 'tbsp' },
            { name: 'Chili Flakes & Sea Salt', quantity: '1', unit: 'pinch' }
          ],
          instructions: [
            'Toast sourdough slices until crispy and golden.',
            'Mash avocados with lemon juice, sea salt, and black pepper in a bowl.',
            'Bring a small pot of water with 1 tbsp vinegar to a gentle simmer. Swirl water and drop eggs inside to poach for 3 minutes.',
            'Spread smashed avocado over toast, top with poached eggs, and sprinkle red pepper flakes.'
          ]
        }
      ]
    },
    {
      name: 'Main Course',
      recipes: [
        {
          title: 'Creamy Paneer Butter Masala',
          description: '<p>Rich Indian cottage cheese curry in a velvety spiced tomato, cashews, and butter gravy.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
          prepTime: 20,
          cookTime: 25,
          servings: 4,
          difficulty: Difficulty.MEDIUM,
          cuisine: 'Indian',
          dietary: 'Vegetarian,Gluten-Free',
          tags: 'Paneer,Indian,Curry,Butter',
          ingredients: [
            { name: 'Paneer Cubes', quantity: '300', unit: 'g' },
            { name: 'Tomato Puree', quantity: '2', unit: 'cups' },
            { name: 'Butter', quantity: '3', unit: 'tbsp' },
            { name: 'Heavy Cream', quantity: '1/4', unit: 'cup' },
            { name: 'Cashew Paste', quantity: '2', unit: 'tbsp' },
            { name: 'Garam Masala & Kasuri Methi', quantity: '1', unit: 'tsp' }
          ],
          instructions: [
            'Heat 2 tbsp butter in a pan. Sauté ginger-garlic paste and onions until golden.',
            'Add tomato puree, cashew paste, chili powder, and coriander powder. Cook until oil separates.',
            'Pour in 1 cup warm water and bring gravy to a simmer.',
            'Add paneer cubes, garam masala, and kasuri methi. Simmer gently for 5 minutes.',
            'Stir in heavy cream and garnish with fresh cilantro. Serve with garlic naan.'
          ]
        },
        {
          title: 'Classic Italian Spaghetti Bolognese',
          description: '<p>Slow-simmered rich beef ragù over al dente spaghetti topped with fresh basil and Parmigiano-Reggiano.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281270?auto=format&fit=crop&w=800&q=80',
          prepTime: 15,
          cookTime: 45,
          servings: 4,
          difficulty: Difficulty.MEDIUM,
          cuisine: 'Italian',
          dietary: 'Non-Vegetarian',
          tags: 'Pasta,Italian,Bolognese,Beef',
          ingredients: [
            { name: 'Spaghetti Pasta', quantity: '400', unit: 'g' },
            { name: 'Ground Beef', quantity: '400', unit: 'g' },
            { name: 'San Marzano Crushed Tomatoes', quantity: '800', unit: 'g' },
            { name: 'Onion, Carrots & Celery Diced', quantity: '1', unit: 'cup' },
            { name: 'Red Wine', quantity: '1/2', unit: 'cup' },
            { name: 'Fresh Parmesan Cheese', quantity: '1/2', unit: 'cup' }
          ],
          instructions: [
            'Sauté finely diced carrots, celery, and onions in olive oil until soft.',
            'Add ground beef and brown thoroughly, breaking up large pieces.',
            'Pour red wine to deglaze pan and simmer for 5 minutes until reduced.',
            'Add crushed tomatoes and tomato paste. Cover and simmer on low heat for 40 minutes.',
            'Boil spaghetti in salted water until al dente. Toss pasta directly into Bolognese sauce and serve with grated parmesan.'
          ]
        }
      ]
    },
    {
      name: 'Dessert',
      recipes: [
        {
          title: 'Decadent Fudgy Chocolate Brownies',
          description: '<p>Rich dark chocolate brownies with shiny crinkly tops, gooey fudgy centers, and walnuts.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
          prepTime: 15,
          cookTime: 25,
          servings: 9,
          difficulty: Difficulty.EASY,
          cuisine: 'American',
          dietary: 'Vegetarian',
          tags: 'Chocolate,Brownies,Dessert,Baking',
          ingredients: [
            { name: 'Dark Chocolate (70%)', quantity: '200', unit: 'g' },
            { name: 'Unsalted Butter', quantity: '150', unit: 'g' },
            { name: 'Granulated Sugar', quantity: '1', unit: 'cup' },
            { name: 'Eggs', quantity: '3', unit: 'large' },
            { name: 'Cocoa Powder', quantity: '1/3', unit: 'cup' },
            { name: 'All-Purpose Flour', quantity: '1/2', unit: 'cup' }
          ],
          instructions: [
            'Melt dark chocolate and butter together in a heatproof bowl set over simmering water.',
            'Whisk eggs and sugar together vigorously for 3 minutes until pale and fluffy.',
            'Fold melted chocolate into egg mixture, then sift in cocoa powder and flour.',
            'Pour batter into a lined 8x8 inch baking pan. Bake at 180°C (350°F) for 22-25 minutes.',
            'Allow brownies to cool completely before slicing into fudgy squares.'
          ]
        }
      ]
    },
    {
      name: 'Beverages',
      recipes: [
        {
          title: 'Fresh Mango Mint Smoothie',
          description: '<p>Refreshing tropical blend of ripe Alphonso mangoes, Greek yogurt, fresh mint leaves, and honey.</p>',
          imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
          prepTime: 5,
          cookTime: 0,
          servings: 2,
          difficulty: Difficulty.EASY,
          cuisine: 'Indian',
          dietary: 'Vegetarian,Gluten-Free',
          tags: 'Mango,Smoothie,Drink,Summer',
          ingredients: [
            { name: 'Ripe Mango Cubes', quantity: '2', unit: 'cups' },
            { name: 'Plain Greek Yogurt', quantity: '1', unit: 'cup' },
            { name: 'Chilled Whole Milk', quantity: '1/2', unit: 'cup' },
            { name: 'Fresh Mint Leaves', quantity: '6', unit: 'leaves' },
            { name: 'Honey', quantity: '2', unit: 'tbsp' }
          ],
          instructions: [
            'Place ripe mango cubes, Greek yogurt, chilled milk, mint leaves, and honey into high-speed blender.',
            'Blend on high speed for 60 seconds until smooth and velvety.',
            'Pour into chilled tall glasses, garnish with mint sprigs, and serve immediately.'
          ]
        }
      ]
    }
  ];

  let createdRecipesCount = 0;

  for (const catData of categoriesData) {
    const category = await prisma.category.create({
      data: { name: catData.name },
    });

    for (const r of catData.recipes) {
      const createdRecipe = await prisma.recipe.create({
        data: {
          title: r.title,
          description: r.description,
          imageUrl: r.imageUrl,
          prepTime: r.prepTime,
          cookTime: r.cookTime,
          servings: r.servings,
          difficulty: r.difficulty,
          cuisine: r.cuisine,
          dietary: r.dietary,
          tags: r.tags,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          authorId: user.id,
          categoryId: category.id,
          ingredients: {
            create: r.ingredients.map((ing) => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          },
          instructions: {
            create: r.instructions.map((text, idx) => ({
              stepNumber: idx + 1,
              instructionText: text,
            })),
          },
        },
      });

      // Add sample reviews & ratings
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Absolutely outstanding recipe! Easy to follow and tastes like restaurant quality.',
          userId: adminUser.id,
          recipeId: createdRecipe.id,
        },
      });

      await prisma.like.create({
        data: {
          userId: adminUser.id,
          recipeId: createdRecipe.id,
        },
      });

      createdRecipesCount++;
    }
  }

  console.log(`🎉 Successfully seeded ${createdRecipesCount} recipes with full metadata, ingredients, steps, reviews & likes!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
