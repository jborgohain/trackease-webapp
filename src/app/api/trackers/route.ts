import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    let dbQuery: any = { $and: [] };

    if (query) {
      dbQuery.$and.push({
        $or: [
          { tracking_code: { $regex: query, $options: 'i' } },
          { 'to_address.name': { $regex: query, $options: 'i' } },
        ],
      });
    }

    if (status) {
      dbQuery.$and.push({ current_status: status });
    }

    if (carrier) {
      dbQuery.$and.push({ carrier: carrier });
    }

    if (dbQuery.$and.length === 0) {
      dbQuery = {};
    }

    const trackers = await db
      .collection('tracked_shipments')
      .find(dbQuery)
      .sort({ 'easypost_created_at': -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalTrackers = await db.collection('tracked_shipments').countDocuments(dbQuery);

    return NextResponse.json({ trackers, totalTrackers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch trackers.' }, { status: 500 });
  }
}