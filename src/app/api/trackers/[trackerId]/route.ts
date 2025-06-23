import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  context: { params: { trackerId: string } } // ✅ this line is OK
) {
  const trackerId = context.params.trackerId;

  if (!trackerId) {
    return NextResponse.json({ message: 'Tracker ID is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection('tracked_shipments');

    if (!ObjectId.isValid(trackerId)) {
      return NextResponse.json({ message: 'Invalid Tracker ID format' }, { status: 400 });
    }

    const trackerDetails = await collection.aggregate([
      { $match: { _id: new ObjectId(trackerId) } },
      {
        $lookup: {
          from: 'company_addresses',
          localField: 'from_address_ref',
          foreignField: '_id',
          as: 'from_address_lookup'
        }
      },
      {
        $addFields: {
          from_address: { $arrayElemAt: ["$from_address_lookup", 0] }
        }
      },
      {
        $project: {
          from_address_lookup: 0,
          from_address_ref: 0
        }
      }
    ]).toArray();

    if (!trackerDetails || trackerDetails.length === 0) {
      return NextResponse.json({ message: 'Tracker not found' }, { status: 404 });
    }

    return NextResponse.json(trackerDetails[0], { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
