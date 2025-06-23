import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    return NextResponse.json({ message: 'Successfully connected to MongoDB!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to connect to MongoDB.' }, { status: 500 });
  }
}