'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, GripVertical, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getTasks, addTask, toggleTaskStatus, updateTaskOrder } from '@/actions/taskActions';

export default function TasksList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchTasks = async () => {
    const data = await getTasks();
    // Filter out completed tasks since they should disappear
    setTasks(data.filter(t => t.status !== 'done'));
  };

  useEffect(() => {
    setMounted(true);
    fetchTasks();
  }, []);

  const toggleTask = (id: string, currentStatus: string) => {
    // Optimistic UI - immediately remove if checked
    if (currentStatus !== 'done') {
      setTasks(tasks.filter(t => t.id !== id));
    }

    startTransition(async () => {
      await toggleTaskStatus(id, currentStatus);
      await fetchTasks();
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setTasks(updatedItems);

    startTransition(async () => {
      await updateTaskOrder(updatedItems.map(item => ({ id: item.id, order: item.order })));
      await fetchTasks();
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const title = newTaskTitle.trim();
    setNewTaskTitle('');
    setIsAdding(false);

    startTransition(async () => {
      await addTask(title, "Medium");
      await fetchTasks();
    });
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || 'none';
    if (p === 'high') return 'text-red-700 bg-red-50 border-red-200';
    if (p === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (p === 'low') return 'text-green-700 bg-green-50 border-green-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">Tasks</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddTask} className="mb-4 flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task..."
            className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={isPending || !newTaskTitle.trim()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </form>
      )}

      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${isPending ? 'opacity-70' : ''}`}>
        {mounted && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks-list">
              {(provided) => (
                <div
                  className="divide-y divide-gray-100"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {tasks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No active tasks. You're all caught up!</div>
                  ) : (
                    tasks.map((task, index) => {
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center px-4 py-3 transition-colors group ${
                                snapshot.isDragging ? 'bg-white shadow-lg ring-1 ring-gray-200 z-10' : 'hover:bg-gray-50 bg-white'
                              }`}
                            >
                              <div
                                className="flex items-center justify-center w-6 h-6 -ml-2 mr-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                {...provided.dragHandleProps}
                              >
                                <GripVertical size={16} />
                              </div>

                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={() => toggleTask(task.id, task.status)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="font-medium text-sm text-gray-900 truncate">
                                  {task.title}
                                </span>
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-4 shrink-0">
                                  <Calendar size={12} className="text-gray-400" />
                                  {format(new Date(task.dueDate), 'MMM d')}
                                </div>
                              )}

                              {task.priority && (
                                <div className="ml-4 shrink-0">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(task.priority)}`}>
                                    <AlertCircle size={10} />
                                    <span className="capitalize">{task.priority}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
