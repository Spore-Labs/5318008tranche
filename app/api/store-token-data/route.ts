import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import TokenData from '../../../models/TokenData';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const tokenData = new TokenData({
      timestamp: new Date(),
      ...body
    });

    await tokenData.save();

    return NextResponse.json({ message: 'Token data stored successfully' });
  } catch (error: unknown) {
    return NextResponse.json(
      { 
        message: 'Error storing token data', 
        error: error instanceof Error ? error.toString() : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
