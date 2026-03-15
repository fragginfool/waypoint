import TasksList from '@/components/TasksList';

export default function TasksPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8 md:hidden">My Tasks</h1>
      <TasksList />
    </div>
  );
}
