
import { NextResponse } from 'next/server';
import { postgresPool } from '@/lib/db/postgres';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [categories, locations, departments, staff] = await Promise.all([
      postgresPool.query(`
        SELECT
          c.id,
          c.name,
          COALESCE(d.name, 'General Administration') AS department_name
        FROM categories c
        LEFT JOIN departments d ON d.id = c.default_department_id
        WHERE c.is_active = TRUE
        ORDER BY c.name
      `),

      postgresPool.query(`
        SELECT id, building, floor, room, description
        FROM locations
        WHERE is_active = TRUE
        ORDER BY building, floor, room
      `),

      postgresPool.query(`
        SELECT id, name, description
        FROM departments
        ORDER BY name
      `),

      postgresPool.query(`
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.department_id,
          d.name AS department_name,
          u.role
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.is_active = TRUE
          AND u.role IN ('STAFF', 'ADMIN')
        ORDER BY u.full_name
      `),
    ]);

    return NextResponse.json({
      categories: categories.rows,
      locations: locations.rows,
      departments: departments.rows,
      staff: staff.rows,
    });
  } catch (error) {
    console.error('Reference data query failed:', error);

    return NextResponse.json(
      { error: 'Unable to load reference data.' },
      { status: 500 },
    );
  }
}
