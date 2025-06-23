import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);

    const trackers = await db
      .collection('tracked_shipments')
      .find({})
      .sort({ 'easypost_created_at': -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(trackers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch trackers.' }, { status: 500 });
  }
}