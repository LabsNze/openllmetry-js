import { NextRequest, NextResponse } from 'next/server';
import { generateShareLink, createSharedProject } from '@/lib/shared-access';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, projectName, type, accessLevel = 'viewer', createdBy = 'user' } = body;

    if (!projectId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure project exists
    createSharedProject(projectId, projectName || 'Untitled Project', createdBy);

    // Generate share link
    const link = generateShareLink(projectId, type, accessLevel, createdBy);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${link.id}?token=${link.token}`;

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        url: shareUrl,
        type: link.type,
        accessLevel: link.accessLevel,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}
