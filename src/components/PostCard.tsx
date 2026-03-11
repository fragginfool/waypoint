import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Post {
  id: string;
  author: string;
  avatarUrl?: string;
  imageUrl?: string;
  content: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const date = new Date(post.createdAt);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8 text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-base">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{post.author}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image / Content */}
      {post.imageUrl ? (
        <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
           {/* In a real app we'd use next/image here */}
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="px-5 pb-2">
          {(() => {
            const hasSummary = post.content.includes('---ACTIVITY_SUMMARY---');
            if (hasSummary) {
              const parts = post.content.split('---ACTIVITY_SUMMARY---');
              const mainText = parts[0]?.trim();
              const summaryJson = parts[1]?.trim();
              let summaryData = null;
              try {
                if (summaryJson) summaryData = JSON.parse(summaryJson);
              } catch (e) {
                console.error("Failed to parse summary", e);
              }

              return (
                <div className="space-y-4">
                  <p className="text-gray-800 whitespace-pre-line text-[15px] leading-relaxed font-semibold text-blue-800">
                    {mainText}
                  </p>
                  
                  {summaryData && (
                    <details className="group border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                      <summary className="flex items-center justify-between cursor-pointer p-3 font-medium text-sm text-gray-700 bg-white hover:bg-gray-50 select-none">
                        <span>View Completed Items</span>
                        <span className="text-blue-500 font-semibold bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                          {(summaryData.tasks?.length || 0) + (summaryData.habits?.length || 0)}
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-100 text-sm text-gray-600 bg-gray-50/50 space-y-3">
                        {summaryData.tasks && summaryData.tasks.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">✅ Tasks Completed</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                              {summaryData.tasks.map((task: string, i: number) => <li key={`t-${i}`}>{task}</li>)}
                            </ul>
                          </div>
                        )}
                        {summaryData.habits && summaryData.habits.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">🔥 Habits Tracked</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                              {summaryData.habits.map((habit: string, i: number) => <li key={`h-${i}`}>{habit}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              );
            }

            return (
              <p className="text-gray-800 whitespace-pre-line text-[15px] leading-relaxed">
                 &quot;{post.content}&quot;
              </p>
            );
          })()}
        </div>
      )}

      {/* Footer / Caption */}
      <div className="p-5 pt-3 pb-4">
        {post.imageUrl && (
          <p className="text-[15px] leading-relaxed text-gray-800 mb-2">
            {post.content}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">
          {formatDistanceToNow(date, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
