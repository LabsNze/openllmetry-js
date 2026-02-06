import { NextRequest, NextResponse } from 'next/server';
import { createAlertRule, getAlertRulesByProject } from '@/lib/alert-engine';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    const rules = getAlertRulesByProject(projectId);
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, condition, threshold, duration, severity, channels } = body;

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const rule = createAlertRule(
      projectId,
      name,
      condition,
      threshold,
      duration,
      severity,
      channels || []
    );

    return NextResponse.json({ success: true, rule });
  } catch (error) {
    console.error('Error creating alert rule:', error);
    return NextResponse.json(
      { error: 'Failed to create alert rule' },
      { status: 500 }
    );
  }
}
