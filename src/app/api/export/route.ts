import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import * as XLSX from 'xlsx';
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
      .toArray();

    const dataToExport = trackers.map(tracker => ({
      'Tracking Code': tracker.tracking_code,
      'Name': tracker.to_address.name,
      'Status': tracker.current_status,
      'Carrier': tracker.carrier,
      'Destination': `${tracker.to_address.city}, ${tracker.to_address.state}`,
      'Created At': new Date(tracker.easypost_created_at).toLocaleDateString("en-US", { timeZone: "UTC" }),
      'Phone': tracker.to_address.phone,
      'Email': tracker.to_address.email,
      'Address': `${tracker.to_address.street1}, ${tracker.to_address.city}, ${tracker.to_address.state} ${tracker.to_address.zip}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trackers');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        // 'Content-Disposition': 'attachment; filename="trackers.xlsx"',
        'Content-Disposition': `attachment; filename="Exported_shipment_details_list_${new Date()
          .toISOString()
          .slice(0, 16)      // "2025-08-16T09:30"
          .replace("T", "_") // -> "2025-08-16_09:30"
          .replace(/:/g, "-")}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to export trackers.' }, { status: 500 });
  }
}