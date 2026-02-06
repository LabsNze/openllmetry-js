import { NextRequest, NextResponse } from 'next/server';
import { getAlertsByProject, getAlertStats, createAlert } from '@/lib/alert-engine';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    const status = request.nextUrl.searchParams.get('status');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    const alerts = getAlertsByProject(projectId, status as any);
    const stats = getAlertStats(projectId);

    return NextResponse.json({
      success: true,
      alerts,
      stats,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      title,
      description,
      severity,
      condition,
      metrics,
      affectedServices,
    } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const alert = createAlert(
      projectId,
      title,
      description || '',
      severity || 'high',
      condition || 'custom',
      metrics || {},
      affectedServices || []
    );

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
