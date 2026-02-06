import { NextRequest, NextResponse } from 'next/server';
import { acknowledgeAlert, resolveAlert } from '@/lib/alert-engine';
import { publishJob } from '@/lib/qstash';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const body = await request.json();
    const { alertId } = params;
    const { action, acknowledgedBy, resolutionMessage } = body;

    if (action === 'acknowledge') {
      const success = acknowledgeAlert(alertId, acknowledgedBy || 'system');
      
      // Queue acknowledgment processing via QStash
      try {
        await publishJob({
          type: 'acknowledge-alert',
          alertId,
          userId: acknowledgedBy || 'system',
        });
      } catch (qstashError) {
        console.warn('[v0] Failed to queue acknowledgment job:', qstashError);
      }
      
      return NextResponse.json({ success, jobQueued: true });
    } else if (action === 'resolve') {
      const success = resolveAlert(alertId);
      
      // Queue resolution processing via QStash
      try {
        await publishJob({
          type: 'resolve-alert',
          alertId,
          userId: acknowledgedBy || 'system',
          message: resolutionMessage || '',
        });
      } catch (qstashError) {
        console.warn('[v0] Failed to queue resolution job:', qstashError);
      }
      
      return NextResponse.json({ success, jobQueued: true });
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
