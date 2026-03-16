'use client';

import { useState, useEffect, useTransition } from 'react';
import { Target, Clock, Activity, Plus, CheckCircle, Trash2, Edit3, X, Save } from 'lucide-react';
import { getGoals, updateGoalProgress, deleteGoal, updateGoalDescription } from '@/actions/goalActions';
import { format } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  targetDate: Date | null;
  category: string;
  timeframe: string;
}

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  
  // New Goal Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Growth');
  const [newTargetDate, setNewTargetDate] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  const fetchGoals = async () => {
    const data = await getGoals();
    setGoals(data);
  };

  useEffect(() => {
    setMounted(true);
    fetchGoals();
  }, []);

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat === 'work') return 'bg-indigo-500';
    if (cat === 'growth') return 'bg-emerald-500';
    if (cat === 'health') return 'bg-rose-500';
    if (cat === 'finance') return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const { addGoal } = await import('@/actions/goalActions');
      await addGoal(
        newTitle.trim(),
        activeTab,
        newCategory,
        0,
        newDescription.trim() || undefined,
        newTargetDate || undefined
      );
      
      // Reset form and fetch updated goals
      setNewTitle('');
      setNewDescription('');
      setNewCategory('Growth');
      setNewTargetDate('');
      setIsAdding(false);
      await fetchGoals();
    });
  };

  const handleComplete = async (id: string) => {
    startTransition(async () => {
      await updateGoalProgress(id, 100);
      await fetchGoals();
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    startTransition(async () => {
      await deleteGoal(id);
      await fetchGoals();
    });
  };


  const handleSaveDescription = async (id: string) => {
    startTransition(async () => {
      await updateGoalDescription(id, editDescription);
      setEditingId(null);
      await fetchGoals();
    });
  };

  const filteredGoals = goals.filter(g => g.timeframe === activeTab);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Goals</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          {isAdding ? 'Cancel' : 'Add'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddGoal} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input 
                type="text" 
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-3"
                placeholder="E.g., Read 12 books"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-3"
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-3"
                >
                  <option value="Growth">Growth</option>
                  <option value="Work">Work</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Date</label>
                <input 
                  type="date" 
                  value={newTargetDate}
                  onChange={e => setNewTargetDate(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 px-3"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={isPending || !newTitle.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Save Goal
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl inline-flex">
        {['Weekly', 'Monthly', 'Yearly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Goals List (Stacked) */}
      <div className={`flex flex-col gap-4 ${isPending ? 'opacity-70' : ''}`}>
        {mounted && filteredGoals.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-6 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            No {activeTab.toLowerCase()} goals set yet.
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg text-white ${getCategoryColor(goal.category)}`}>
                      <Target size={16} />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {goal.category}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleComplete(goal.id)}
                      className={`p-1.5 rounded-lg transition-colors ${goal.progress === 100 ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                      title="Complete Goal"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-semibold text-gray-900 ${goal.progress === 100 ? 'line-through text-gray-400' : ''}`}>
                    {goal.title}
                  </h3>
                </div>
                
                {editingId === goal.id ? (
                  <div className="mb-4">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1 px-2"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end gap-1 mt-1">
                      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={14} /></button>
                      <button onClick={() => handleSaveDescription(goal.id)} className="p-1 text-blue-500 hover:text-blue-700"><Save size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="group relative flex items-start gap-1 mb-4">
                    <p className="text-xs text-gray-500 line-clamp-2 italic">
                      {goal.description || 'No notes added yet...'}
                    </p>
                    <button 
                      onClick={() => {
                        setEditingId(goal.id);
                        setEditDescription(goal.description || '');
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-opacity"
                    >
                      <Edit3 size={12} />
                    </button>
                  </div>
                )}

              </div>

              {goal.targetDate && (
                <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
