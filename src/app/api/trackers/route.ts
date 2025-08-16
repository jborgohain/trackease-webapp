import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Filter, Document } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const conditions: Filter<Document>[] = [];

    if (query) {
      conditions.push({
        $or: [
          { tracking_code: { $regex: query, $options: 'i' } },
          { 'to_address.name': { $regex: query, $options: 'i' } },
        ],
      });
    }

    if (status) {
      conditions.push({ current_status: status });
    }

    if (carrier) {
      conditions.push({ carrier: carrier });
    }

    if (startDate || endDate) {
        const dateFilter: { $gte?: Date; $lte?: Date } = {};
        if (startDate) {
            dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            dateFilter.$lte = endOfDay;
        }
        conditions.push({ easypost_created_at: dateFilter });
    }

    const dbQuery: Filter<Document> = conditions.length > 0 ? { $and: conditions } : {};

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