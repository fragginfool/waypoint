'use client';

import { useState, useTransition } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { addPost } from '@/actions/postActions';

export default function NewEntryForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      let finalImageUrl: string | undefined = undefined;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { uploadImage } = await import('@/actions/uploadActions');
        const uploadedUrl = await uploadImage(formData);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      // Hardcode author to "Me" for now
      await addPost(content.trim(), finalImageUrl);
      
      setContent('');
      setFile(null);
      setIsOpen(false);
    });
  };

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Journal Feed</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              startTransition(async () => {
                const { captureDaySummary } = await import('@/actions/postActions');
                const res = await captureDaySummary();
                if (res && res.success === false) {
                  alert(res.message);
                }
              });
            }}
            disabled={isPending}
            className="bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span className="text-sm font-medium px-1">{isPending ? 'Capturing...' : 'Capture Day'}</span>
          </button>
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Camera size={18} />
            <span className="text-sm font-medium pr-1">New Entry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Journal Feed</h1>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center gap-1 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
        >
          <X size={16} /> Cancel
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">New Journal Entry</h2>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
            required
            autoFocus
          />
        </div>

        <div>
           <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <ImageIcon size={16} />
            Photo (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isPending ? 'Saving...' : 'Post Entry'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
