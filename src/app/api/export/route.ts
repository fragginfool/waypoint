import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import JSZip from 'jszip';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    if (posts.length === 0) {
      return new NextResponse('No journal entries found.', { status: 404 });
    }

    const zip = new JSZip();

    // Group posts by Year, then by Month
    // Structure: { [year]: { [month]: "Markdown content..." } }
    const groupedPosts: Record<string, Record<string, string>> = {};

    for (const post of posts) {
      const year = format(post.createdAt, 'yyyy');
      const month = format(post.createdAt, 'MMMM');
      const dateStr = format(post.createdAt, 'MMMM d, yyyy \\at h:mm a');

      if (!groupedPosts[year]) {
        groupedPosts[year] = {};
      }
      if (!groupedPosts[year]![month]) {
        // Initialize the markdown file with a header
        groupedPosts[year]![month] = `# Journal Entries - ${month} ${year}\n\n`;
      }

      let postMarkdown = `## ${dateStr}\n\n`;

      if (post.imageUrl) {
        if (post.imageUrl.startsWith('/uploads/')) {
          // Local image: add to zip and link relatively
          const imageFileName = post.imageUrl.replace('/uploads/', '');
          const localImagePath = path.join(process.cwd(), 'public', 'uploads', imageFileName);
          
          try {
            if (fs.existsSync(localImagePath)) {
              const imageBuffer = fs.readFileSync(localImagePath);
              zip.folder(year)?.folder(month)?.folder('images')?.file(imageFileName, imageBuffer);
              postMarkdown += `![Image](images/${imageFileName})\n\n`;
            } else {
              postMarkdown += `![Image (Missing)](${post.imageUrl})\n\n`;
            }
          } catch (e) {
            console.error("Failed to read image for export:", e);
            postMarkdown += `![Image (Error)](${post.imageUrl})\n\n`;
          }
        } else {
          // External image URL
           postMarkdown += `![Image](${post.imageUrl})\n\n`;
        }
      }

      // Check if it's an End of Day summary post
      let postBody = post.content;
      if (postBody.includes('---ACTIVITY_SUMMARY---')) {
        const parts = postBody.split('---ACTIVITY_SUMMARY---');
        let mainText = parts[0]?.trim() || '';
        const summaryJson = parts[1]?.trim();
        
        postMarkdown += `${mainText}\n\n`;

        try {
          if (summaryJson) {
            const summaryData = JSON.parse(summaryJson);
            if (summaryData.tasks && summaryData.tasks.length > 0) {
              postMarkdown += `### ✅ Tasks Completed\n`;
              for (const task of summaryData.tasks) {
                postMarkdown += `- ${task}\n`;
              }
              postMarkdown += `\n`;
            }
            if (summaryData.habits && summaryData.habits.length > 0) {
              postMarkdown += `### 🔥 Habits Tracked\n`;
              for (const habit of summaryData.habits) {
                postMarkdown += `- ${habit}\n`;
              }
              postMarkdown += `\n`;
            }
          }
        } catch (e) {
          console.error("Failed to parse summary in export", e);
        }
      } else {
        postMarkdown += `${postBody}\n\n`;
      }

      postMarkdown += `---\n\n`;

      groupedPosts[year]![month] += postMarkdown;
    }

    // Add generated markdown files to zip
    for (const year in groupedPosts) {
      for (const month in groupedPosts[year]) {
        const markdownContent = groupedPosts[year]![month];
        zip.folder(year)?.folder(month)?.file(`${month}.md`, markdownContent!);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="waypoint-export.zip"'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
