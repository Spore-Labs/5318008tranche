import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import TokenData from '../../../../models/TokenData';
import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const JWT_KEY_NAME = process.env.JWT_KEY_NAME;

if (!PRIVATE_KEY || !JWT_KEY_NAME) {
  throw new Error('Missing JWT configuration in environment variables');
}

const createInfuraJWT = async () => {
  const privateKey = createPrivateKey({
    key: PRIVATE_KEY,
    format: 'pem',
  });

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: JWT_KEY_NAME })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  return jwt;
};

export async function POST(request: Request) {
  // Verify that the request is coming from GitHub Actions
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Fetch current token data from your existing API
    const response = await fetch('https://docs.5318008.io/api/total');
    const totalData = await response.json();
    const circulatingResponse = await fetch('https://docs.5318008.io/api/circulating');
    const circulatingData = await circulatingResponse.json();
    const fdvmcapResponse = await fetch('https://docs.5318008.io/api/fdvmcap');
    const fdvmcapData = await fdvmcapResponse.json();
    const circulatingmcapResponse = await fetch('https://docs.5318008.io/api/circulatingmcap');
    const circulatingmcapData = await circulatingmcapResponse.json();
    const liquidityResponse = await fetch('https://docs.5318008.io/api/liquidity');
    const liquidityData = await liquidityResponse.json();

    const now = new Date();

    const tokenData = new TokenData({
      timestamp: now,
      total: Number(totalData.result) / 1e18,
      circulating: Number(circulatingData.result) / 1e18,
      fdv: Number(fdvmcapData.result),
      marketCap: Number(circulatingmcapData.result),
      liquidity: Number(liquidityData.result)
    });

    await tokenData.save();
    return NextResponse.json({ message: 'Token data updated successfully' });
  } catch (error: unknown) {
    console.error('Error in update-token-data:', error);
    return NextResponse.json(
      { 
        message: 'Error updating token data', 
        error: error instanceof Error ? error.toString() : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
