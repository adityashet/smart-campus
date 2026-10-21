import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { postgresPool } from '@/lib/db/postgres';

export const runtime = 'nodejs';

const assignmentSchema = z.object({
  complaintId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  staffId: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  assignedBy: z.coerce.number().int().positive(),
  notes: z.string().trim().max(1000).optional().default(''),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = assignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { complaintId, departmentId, staffId, assignedBy, notes } = parsed.data;
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

    if (!['REVIEWED', 'ASSIGNED'].includes(oldStatus)) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: `Complaint must be reviewed before assignment. Current status: ${oldStatus}.` },
        { status: 409 },
      );
    }

    const departmentResult = await client.query(
      'SELECT id FROM departments WHERE id = $1',
      [departmentId],
    );

    if (departmentResult.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: 'Department not found.' },
        { status: 400 },
      );
    }

    const adminResult = await client.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = TRUE',
      [assignedBy],
    );

    if (adminResult.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return NextResponse.json(
        { error: 'Assigning user not found or inactive.' },
        { status: 400 },
      );
    }

    if (staffId != null) {
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
    }

    await client.query(
      `UPDATE assignments
       SET ended_at = NOW()
       WHERE complaint_id = $1 AND ended_at IS NULL`,
      [complaintId],
    );

    await client.query(
      `INSERT INTO assignments
       (complaint_id, department_id, staff_id, assigned_by, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [complaintId, departmentId, staffId ?? null, assignedBy, notes],
    );

    const updated = await client.query(
      `UPDATE complaints
       SET assigned_department_id = $1,
           assigned_staff_id = $2,
           status = 'ASSIGNED',
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, public_id, title, status, assigned_department_id,
                 assigned_staff_id, updated_at`,
      [departmentId, staffId ?? null, complaintId],
    );

    await client.query(
      `INSERT INTO complaint_status_history
       (complaint_id, old_status, new_status, changed_by, notes)
       VALUES ($1, $2, 'ASSIGNED', $3, $4)`,
      [complaintId, oldStatus, assignedBy, notes],
    );

    await client.query('COMMIT');
    transactionStarted = false;

    return NextResponse.json({
      message: 'Complaint assigned successfully.',
      complaint: updated.rows[0],
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK').catch(() => undefined);
    }

    console.error('POST complaint assignment failed:', error);

    return NextResponse.json(
      { error: 'Unable to assign complaint.' },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}