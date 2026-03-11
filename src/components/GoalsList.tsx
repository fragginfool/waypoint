'use client';

import { useState, useEffect, useTransition } from 'react';
import { Target, Clock, Activity, Plus } from 'lucide-react';
import { getGoals } from '@/actions/goalActions';
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

      {/* Goals Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isPending ? 'opacity-70' : ''}`}>
        {mounted && filteredGoals.length === 0 ? (
          <div className="col-span-1 md:col-span-2 p-6 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            No {activeTab.toLowerCase()} goals set yet.
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg text-white ${getCategoryColor(goal.category)}`}>
                      <Target size={16} />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {goal.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 mb-1">{goal.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-1">{goal.description || 'No description'}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-900">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${getCategoryColor(goal.category)}`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {goal.targetDate && (
                <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
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
