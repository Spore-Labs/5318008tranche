import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import TokenData from '../../../models/TokenData';

export async function GET() {
  try {
    await dbConnect();
    const historicalData = await TokenData.find().sort({ timestamp: 1 }).limit(100);
    return NextResponse.json(historicalData);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching historical token data', error }, { status: 500 });
  }
}
