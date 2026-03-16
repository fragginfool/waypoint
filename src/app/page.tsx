import PostCard, { Post } from '@/components/PostCard';
import NewEntryForm from '@/components/NewEntryForm';
import { getPosts } from '@/actions/postActions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const postsFromDb = await getPosts();

  // Transform DB posts to match the PostCard prop type
  const posts: Post[] = postsFromDb.map((post: any) => ({
    id: post.id,
    author: post.author,
    content: post.content,
    imageUrl: post.imageUrl || undefined,
    createdAt: post.createdAt.toISOString()
  }));

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Journal Section */}
      <div>
        <NewEntryForm />

        <div className="max-w-xl mx-auto space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No journal entries yet. Capture your first moment!</div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
