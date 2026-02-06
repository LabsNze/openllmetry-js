import { NextRequest, NextResponse } from 'next/server';
import { acknowledgeAlert, resolveAlert } from '@/lib/alert-engine';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const body = await request.json();
    const { alertId } = params;
    const { action, acknowledgedBy } = body;

    if (action === 'acknowledge') {
      const success = acknowledgeAlert(alertId, acknowledgedBy || 'system');
      return NextResponse.json({ success });
    } else if (action === 'resolve') {
      const success = resolveAlert(alertId);
      return NextResponse.json({ success });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
