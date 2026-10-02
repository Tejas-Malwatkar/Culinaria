import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { getCategories } from '../../api/public';
import { createRecipe } from '../../api/recipe.api';
import { useToast } from '../../context/ToastContext';
import type { IngredientInput, Difficulty } from '../../types/recipe';

interface Category {
  id: string;
  name: string;
}

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(20);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState('');
  const [tags, setTags] = useState('');

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', quantity: '', unit: 'cups' },
    { name: '', quantity: '', unit: 'g' },
  ]);

  const [instructions, setInstructions] = useState<string[]>([
    'Prepare all ingredients by washing and chopping finely.',
    'Sauté and mix ingredients according to heat preferences.',
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Describe your recipe story, flavor notes, and serving suggestions here...</p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-amber max-w-none min-h-[160px] focus:outline-none p-4 text-slate-800 text-sm',
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch {
        setError('Failed to load categories.');
      }
    };
    fetchCategories();
  }, []);

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientInput,
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)),
    );
  };

  const addInstructionStep = () => {
    setInstructions((prev) => [...prev, '']);
  };

  const removeInstructionStep = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInstructionStep = (index: number, value: string) => {
    setInstructions((prev) =>
      prev.map((step, i) => (i === index ? value : step)),
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Recipe title is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    const cleanedIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim(),
    );

    if (cleanedIngredients.length === 0) {
      setError('Please provide at least one valid ingredient');
      return;
    }

    const cleanedInstructions = instructions
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const description = editor?.getHTML() || '';

    try {
      setLoading(true);

      const created = await createRecipe({
        title: title.trim(),
        categoryId,
        description,
        imageUrl: imageUrl.trim() || null,
        prepTime: Number(prepTime),
        cookTime: Number(cookTime),
        servings: Number(servings),
        difficulty,
        cuisine: cuisine.trim() || null,
        dietary: dietary.trim() || null,
        tags: tags.trim() || null,
        ingredients: cleanedIngredients,
        instructions: cleanedInstructions,
      });

      addToast('Recipe created and published successfully!', 'success');
      navigate(`/recipes/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Create New Recipe</h1>
          <p className="text-xs text-slate-500 mt-1">
            Share your culinary masterpiece with full metadata, ingredients, and step-by-step instructions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-amber-100 p-6 sm:p-10 rounded-3xl shadow-sm space-y-8"
        >
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl">
              {error}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Authentic Italian Creamy Carbonara"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cuisine (Optional)
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Italian, Indian, Mexican, Chinese"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {imageUrl && (
                  <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Invalid image URL')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COOKING METRICS */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
              2. Cooking Parameters
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prep Time (mins)
                </label>
                <input
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cook Time (mins)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dietary Preferences
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="e.g. Vegetarian, Vegan, Gluten-Free"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Pasta, Italian, Quick, Dinner"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* INGREDIENTS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Ingredients List *
              </h3>
              <button
                type="button"
                onClick={addIngredient}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    placeholder="Ingredient name (e.g. Fresh Paneer)"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                    placeholder="Quantity (e.g. 200)"
                    className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={ing.unit || ''}
                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                    placeholder="Unit (e.g. g, cups, tbsp)"
                    className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-bold p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* STEP-BY-STEP INSTRUCTIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Step-by-Step Instructions
              </h3>
              <button
                type="button"
                onClick={addInstructionStep}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-3">
              {instructions.map((stepText, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-1">
                    {idx + 1}
                  </span>
                  <textarea
                    value={stepText}
                    onChange={(e) => updateInstructionStep(idx, e.target.value)}
                    placeholder={`Step ${idx + 1} instruction...`}
                    rows={2}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstructionStep(idx)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-bold p-1 mt-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION RICH EDITOR */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
              5. Recipe Overview & Description
            </h3>
            <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-60 text-sm"
            >
              {loading ? 'Creating Recipe...' : 'Publish Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
