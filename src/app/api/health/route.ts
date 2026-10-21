import { NextResponse } from 'next/server';
import { postgresPool } from '@/lib/db/postgres';
import { getMongoDb } from '@/lib/db/mongodb';

export const runtime = 'nodejs';

export async function GET() {
  const result = {
    status: 'ok',
    postgres: 'not checked',
    mongodb: 'not checked',
  };

  try {
    await postgresPool.query('SELECT 1');
    result.postgres = 'connected';
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
    result.postgres = 'failed';
  }

  try {
    await getMongoDb().then((db) => db.command({ ping: 1 }));
    result.mongodb = 'connected';
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    result.mongodb = 'failed';
  }

  const healthy =
    result.postgres === 'connected' &&
    result.mongodb === 'connected';

  return NextResponse.json(result, {
    status: healthy ? 200 : 503,
  });
}
