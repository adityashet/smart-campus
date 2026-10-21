import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { postgresPool } from '@/lib/db/postgres';

export const runtime = 'nodejs';

const resolutionSchema = z.object({
  complaintId: z.coerce.number().int().positive(),
  staffId: z.coerce.number().int().positive(),
  description: z.string().trim().min(3).max(5000),
  actualCost: z.coerce.number().min(0).optional(),
  notes: z.string().trim().max(2000).optional().default(''),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = resolutionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { complaintId, staffId, description, actualCost, notes } = parsed.data;
  const client = await postgresPool.connect();
  let transactionStarted = false;

  try {
    await client.query('BEGIN');
    transactionStarted = true;

    const complaintResult = await client.query(
      'SELECT id, status FROM complaints WHERE id = $1 FOR UPDATE',
      [complaintId],
    );

    if (complaintResult.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 },
      );
    }

    const oldStatus = complaintResult.rows[0].status as string;

    if (oldStatus !== 'IN_PROGRESS') {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: `Only IN_PROGRESS complaints can be resolved. Current status: ${oldStatus}.` },
        { status: 409 },
      );
    }

    const staffResult = await client.query(
      "SELECT id FROM users WHERE id = $1 AND is_active = TRUE AND role = 'STAFF'",
      [staffId],
    );

    if (staffResult.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: 'Staff user not found, inactive, or not a staff member.' },
        { status: 400 },
      );
    }

    const resolutionNotes = [
      description,
      actualCost !== undefined ? `Actual cost: ${actualCost}` : '',
      notes,
    ].filter(Boolean).join('\n\n');

    await client.query(
      `INSERT INTO resolutions (complaint_id, resolved_by, resolution_notes)
       VALUES ($1, $2, $3)`,
      [complaintId, staffId, resolutionNotes],
    );

    const updated = await client.query(
      `UPDATE complaints
       SET status = 'RESOLVED', resolved_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING id, public_id, title, status, resolved_at, updated_at`,
      [complaintId],
    );

    await client.query(
      `INSERT INTO complaint_status_history
       (complaint_id, old_status, new_status, changed_by, notes)
       VALUES ($1, $2, 'RESOLVED', $3, $4)`,
      [complaintId, oldStatus, staffId, description],
    );

    await client.query('COMMIT');
    transactionStarted = false;

    return NextResponse.json({
      message: 'Complaint resolved successfully.',
      complaint: updated.rows[0],
      resolution: {
        description,
        actualCost: actualCost ?? null,
        notes,
        resolvedBy: staffId,
      },
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK').catch(() => undefined);
    }

    console.error('POST complaint resolution failed:', error);

    return NextResponse.json(
      { error: 'Unable to resolve complaint.' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}