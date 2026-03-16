'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { updatePost, deletePost } from '@/actions/postActions';

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
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isPending, startTransition] = useTransition();
  const date = new Date(post.createdAt);

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    startTransition(async () => {
      await updatePost(post.id, editContent.trim());
      setIsEditing(false);
      setShowMenu(false);
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    startTransition(async () => {
      await deletePost(post.id);
      setShowMenu(false);
    });
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8 text-gray-900 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-base">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{post.author}</p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 size={16} className="text-blue-500" />
                  Edit Post
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image / Content */}
      {post.imageUrl && !isEditing && (
        <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-5 pb-2">
        {isEditing ? (
          <div className="space-y-3 py-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-4 border border-blue-200 rounded-2xl bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px] leading-relaxed resize-none"
              rows={5}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-full shadow-sm transition-colors"
              >
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          (() => {
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
                 {post.imageUrl ? post.content : `"${post.content}"`}
              </p>
            );
          })()
        )}
      </div>

      {/* Footer / Time */}
      {!isEditing && (
        <div className="p-5 pt-3 pb-4 border-t border-gray-50 bg-gray-50/30">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            {formatDistanceToNow(date, { addSuffix: true })}
          </p>
        </div>
      )}
    </div>
  );
}
