import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { getRecipeForEdit, updateRecipe } from '../../api/recipe.api';
import { getCategories } from '../../api/public';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { IngredientInput, Difficulty } from '../../types/recipe';

interface Category {
  id: string;
  name: string;
}

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-amber max-w-none min-h-[160px] focus:outline-none p-4 text-slate-800 text-sm',
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const recipe = await getRecipeForEdit(id);

        if (!user || (recipe.authorId !== user.id && user.role !== 'ADMIN')) {
          addToast('Unauthorized to edit this recipe', 'error');
          navigate('/dashboard');
          return;
        }

        const cats = await getCategories();
        setCategories(cats);

        setTitle(recipe.title);
        setCategoryId(recipe.categoryId);
        setImageUrl(recipe.imageUrl || '');
        setPrepTime(recipe.prepTime || 15);
        setCookTime(recipe.cookTime || 20);
        setServings(recipe.servings || 4);
        setDifficulty(recipe.difficulty || 'EASY');
        setCuisine(recipe.cuisine || '');
        setDietary(recipe.dietary || '');
        setTags(recipe.tags || '');

        setIngredients(
          recipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit || '',
          })),
        );

        if (recipe.instructions && recipe.instructions.length > 0) {
          setInstructions(recipe.instructions.map((step) => step.instructionText));
        } else {
          setInstructions(['Prepare ingredients', 'Cook thoroughly']);
        }

        editor?.commands.setContent(recipe.description);
      } catch {
        addToast('Recipe not found', 'error');
        navigate('/dashboard');
      } flex: {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate, editor, addToast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');

    if (!title.trim() || !categoryId) {
      setError('Title and Category are required');
      return;
    }

    const cleanedIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim(),
    );

    if (cleanedIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const cleanedInstructions = instructions
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      setSaving(true);

      await updateRecipe(id, {
        title: title.trim(),
        categoryId,
        description: editor?.getHTML() ?? '',
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

      addToast('Recipe updated successfully!', 'success');
      navigate(`/recipes/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading recipe details...</div>;
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-slate-900">Edit Recipe</h1>

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
              Basic Information
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
                  Cuisine
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* COOKING PARAMETERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prep Time (mins)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cook Time (mins)</label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Servings</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          {/* INGREDIENTS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Ingredients List</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + Add Ingredient
              </button>
            </div>

            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                  placeholder="Ingredient name"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
                <input
                  type="text"
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                  placeholder="Quantity"
                  className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
                <input
                  type="text"
                  value={ing.unit || ''}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  placeholder="Unit"
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

          {/* INSTRUCTIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Instructions Steps</h3>
              <button
                type="button"
                onClick={addInstructionStep}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                + Add Step
              </button>
            </div>

            {instructions.map((stepText, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-1">
                  {idx + 1}
                </span>
                <textarea
                  value={stepText}
                  onChange={(e) => updateInstructionStep(idx, e.target.value)}
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

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
              Description
            </h3>
            <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-60 text-sm"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/recipes/${id}`)}
              className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
