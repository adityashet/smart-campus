
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { postgresPool } from '@/lib/db/postgres';
import { getMongoDb } from '@/lib/db/mongodb';

export const runtime = 'nodejs';

const complaintSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10),
  categoryId: z.coerce.number().int().positive(),
  locationId: z.coerce.number().int().positive(),
  submittedBy: z.coerce.number().int().positive(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  safetyRisk: z.boolean().default(false),
  affectsMultiplePeople: z.boolean().default(false),
  recurring: z.boolean().default(false),
  roomDetails: z.string().trim().max(200).optional().default(''),
  contactPreference: z.string().trim().max(100).optional(),
  additionalNotes: z.string().trim().max(2000).optional(),

});

function calculatePriority(
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  safetyRisk: boolean,
  affectsMultiplePeople: boolean,
  recurring: boolean,
) {
  const points = { LOW: 10, MEDIUM: 30, HIGH: 50, CRITICAL: 65 };
  return Math.min(
    100,
    points[severity] +
      (safetyRisk ? 20 : 0) +
      (affectsMultiplePeople ? 10 : 0) +
      (recurring ? 5 : 0),
  );
}

// GET /api/complaints

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');

    const allowedStatuses = [
      'SUBMITTED',
      'REVIEWED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REJECTED',
    ];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid complaint status.' },
        { status: 400 },
      );
    }

    const values: string[] = [];
    let statusCondition = '';

    if (status) {
      values.push(status);
      statusCondition = 'WHERE c.status = $1';
    }

    const result = await postgresPool.query(
      `
        SELECT
          c.id,
          c.public_id,
          c.title,
          c.description,
          c.status,
          c.severity,
          c.priority_score,
          c.created_at,
          c.updated_at,
          cat.id AS category_id,
          cat.name AS category_name,
          l.id AS location_id,
          l.building,
          l.floor,
          l.room,
          u.id AS submitted_by_id,
          u.full_name AS submitted_by_name,
          u.email AS submitted_by_email,
          d.name AS department_name,
          c.assigned_department_id,
          c.assigned_staff_id,
          staff.full_name AS assigned_staff_name
        FROM complaints c
        JOIN categories cat ON cat.id = c.category_id
        JOIN locations l ON l.id = c.location_id
        JOIN users u ON u.id = c.submitted_by
        LEFT JOIN departments d ON d.id = c.assigned_department_id
        LEFT JOIN users staff ON staff.id = c.assigned_staff_id
        ${statusCondition}
        ORDER BY c.priority_score DESC, c.created_at ASC
        LIMIT 100
      `,
      values,
    );

    return NextResponse.json({
      complaints: result.rows,
      count: result.rowCount ?? 0,
    });
  } catch (error) {
    console.error('GET complaints failed:', error);

    return NextResponse.json(
      { error: 'Unable to retrieve complaints.' },
      { status: 500 },
    );
  }
}


// POST /api/complaints
export async function POST(request: NextRequest) {
  let input: z.infer<typeof complaintSchema>;

  try {
    const body: unknown = await request.json();
    input = complaintSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid complaint data.', details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Request body must contain valid JSON.' },
      { status: 400 },
    );
  }

  const priorityScore = calculatePriority(
    input.severity,
    input.safetyRisk,
    input.affectsMultiplePeople,
    input.recurring,
  );

  const client = await postgresPool.connect();
  let complaint: Record<string, unknown>;

  try {
    await client.query('BEGIN');

    // Confirm the category and obtain its default department.
    const category = await client.query(
      `SELECT default_department_id
       FROM categories
       WHERE id = $1 AND is_active = TRUE`,
      [input.categoryId],
    );

    if (category.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Category not found or inactive.' },
        { status: 400 },
      );
    }

    // Confirm that the location exists and is active.
    const location = await client.query(
      'SELECT id FROM locations WHERE id = $1 AND is_active = TRUE',
      [input.locationId],
    );

    if (location.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Location not found or inactive.' },
        { status: 400 },
      );
    }

    // Confirm the submitter exists and is active.
    const user = await client.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = TRUE',
      [input.submittedBy],
    );

    if (user.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Submitter not found or inactive.' },
        { status: 400 },
      );
    }

    const inserted = await client.query(
      `INSERT INTO complaints (
         title, description, category_id, location_id,
         submitted_by, assigned_department_id, severity, priority_score
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, public_id, title, description, status,
                 severity, priority_score, created_at`,
      [
        input.title,
        input.description,
        input.categoryId,
        input.locationId,
        input.submittedBy,
        category.rows[0].default_department_id,
        input.severity,
        priorityScore,
      ],
    );

    complaint = inserted.rows[0];

    await client.query(
      `INSERT INTO complaint_status_history
         (complaint_id, old_status, new_status, changed_by, notes)
       VALUES ($1, NULL, 'SUBMITTED', $2, $3)`,
      [
        complaint.id,
        input.submittedBy,
        'Complaint submitted',
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('POST complaints database transaction failed:', error);

    return NextResponse.json(
      { error: 'Unable to create complaint. Check the submitted IDs and database logs.' },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  // Save supplementary details and an activity log in MongoDB.
  // These writes happen after the PostgreSQL transaction commits.
  let mongoSaved = true;

  try {
    const db = await getMongoDb();
    const now = new Date();

    await db.collection('complaint_details').updateOne(
      { complaintPublicId: complaint.public_id },
      {
        $set: {
          complaintPublicId: complaint.public_id,
          safetyRisk: input.safetyRisk,
          affectsMultiplePeople: input.affectsMultiplePeople,
          recurring: input.recurring,
          roomDetails: input.roomDetails,
          contactPreference: input.contactPreference ?? '',
          additionalNotes: input.additionalNotes ?? '',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    await db.collection('activity_logs').insertOne({
      complaintPublicId: complaint.public_id,
      actorId: input.submittedBy,
      action: 'COMPLAINT_SUBMITTED',
      createdAt: now,
    });
  } catch (error) {
    mongoSaved = false;
    console.error('MongoDB complaint logging failed:', error);
  }

  return NextResponse.json(
    {
      message: 'Complaint created.',
      complaint,
      mongoSaved,
    },
    { status: 201 },
  );
}
