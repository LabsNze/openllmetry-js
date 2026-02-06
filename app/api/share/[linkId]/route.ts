import { NextRequest, NextResponse } from 'next/server';
import { getAccessLink, validateAccessToken } from '@/lib/shared-access';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const token = request.nextUrl.searchParams.get('token');

    let link = null;

    // Validate by link ID
    if (linkId) {
      link = getAccessLink(linkId);
    }

    // Fallback: validate by token
    if (!link && token) {
      link = validateAccessToken(token);
    }

    if (!link) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      access: {
        projectId: link.projectId,
        accessLevel: link.accessLevel,
        type: link.type,
        viewCount: link.viewCount,
      },
    });
  } catch (error) {
    console.error('Error validating access:', error);
    return NextResponse.json(
      { error: 'Failed to validate access' },
      { status: 500 }
    );
  }
}
