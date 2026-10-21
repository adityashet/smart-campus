import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { postgresPool } from '@/lib/db/postgres';

export const runtime = 'nodejs';

const statusSchema = z.object({
  complaintId: z.coerce.number().int().positive(),
  status: z.enum([
    'REVIEWED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED',
  ]),
  changedBy: z.coerce.number().int().positive(),
  notes: z.string().trim().max(1000).optional().default(''),
});

const allowedTransitions: Record<string, string[]> = {
  SUBMITTED: ['REVIEWED', 'REJECTED'],
  REVIEWED: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
  REJECTED: [],
};

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { complaintId, status, changedBy, notes } = parsed.data;
  const client = await postgresPool.connect();
  let transactionStarted = false;

  try {
    await client.query('BEGIN');
    transactionStarted = true;

    const current = await client.query(
      'SELECT id, status FROM complaints WHERE id = $1 FOR UPDATE',
      [complaintId],
    );

    if (current.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 },
      );
    }

    const oldStatus = current.rows[0].status as string;

    if (!allowedTransitions[oldStatus]?.includes(status)) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: `Status cannot change from ${oldStatus} to ${status}.` },
        { status: 409 },
      );
    }

    const user = await client.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = TRUE',
      [changedBy],
    );

    if (user.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: 'User not found or inactive.' },
        { status: 400 },
      );
    }

    const updated = await client.query(
      'UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, public_id, title, status, updated_at',
      [status, complaintId],
    );

    await client.query(
      'INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, notes) VALUES ($1, $2, $3, $4, $5)',
      [complaintId, oldStatus, status, changedBy, notes],
    );

    await client.query('COMMIT');
    transactionStarted = false;

    return NextResponse.json({
      message: 'Complaint status updated.',
      complaint: updated.rows[0],
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK').catch(() => undefined);
    }

    console.error('PATCH complaint status failed:', error);

    return NextResponse.json(
      { error: 'Unable to update complaint status.' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}