import { NextRequest, NextResponse } from 'next/server';
import { getErrorsByProject, getErrorStats, captureError } from '@/lib/error-monitor';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    const errors = getErrorsByProject(projectId, limit);
    const stats = getErrorStats(projectId);

    return NextResponse.json({
      success: true,
      errors,
      stats,
    });
  } catch (error) {
    console.error('Error fetching errors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, message, stack, type, context, environment } = body;

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const error = captureError(
      projectId,
      message,
      stack || '',
      type || 'Error',
      context || {},
      environment || 'production'
    );

    return NextResponse.json({
      success: true,
      error,
    });
  } catch (error) {
    console.error('Error capturing error:', error);
    return NextResponse.json(
      { error: 'Failed to capture error' },
      { status: 500 }
    );
  }
}
