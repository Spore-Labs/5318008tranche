import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import TokenData from '../../../models/TokenData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get('timeFrame') || 'raw';

  try {
    await dbConnect();

    const ticksToFetch = 72;
    const latestDataPoint = await TokenData.findOne().sort({ timestamp: -1 });

    if (!latestDataPoint) {
      return NextResponse.json([]);
    }

    const latestTimestamp = latestDataPoint.timestamp;
    const groupingInterval = getGroupingInterval(timeFrame);
    const startTimestamp = new Date(latestTimestamp.getTime() - (ticksToFetch * groupingInterval.milliseconds));

    let pipeline: any[] = [];

    if (timeFrame !== 'raw') {
      pipeline = [
        {
          $match: {
            timestamp: { $gte: startTimestamp, $lte: latestTimestamp }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [timeFrame, '1w'] },
                    then: {
                      $dateFromParts: {
                        isoWeekYear: { $isoWeekYear: "$timestamp" },
                        isoWeek: { $isoWeek: "$timestamp" },
                        isoDayOfWeek: 1
                      }
                    }
                  },
                  {
                    case: { $eq: [timeFrame, '1M'] },
                    then: {
                      $dateFromParts: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: 1
                      }
                    }
                  }
                ],
                default: {
                  $dateTrunc: {
                    date: "$timestamp",
                    unit: groupingInterval.unit,
                    binSize: groupingInterval.binSize
                  }
                }
              }
            },
            timestamp: { $first: "$timestamp" },
            total_open: { $first: "$total" },
            total_high: { $max: "$total" },
            total_low: { $min: "$total" },
            total_close: { $last: "$total" },
            circulating_open: { $first: "$circulating" },
            circulating_high: { $max: "$circulating" },
            circulating_low: { $min: "$circulating" },
            circulating_close: { $last: "$circulating" },
            fdv_open: { $first: "$fdv" },
            fdv_high: { $max: "$fdv" },
            fdv_low: { $min: "$fdv" },
            fdv_close: { $last: "$fdv" },
            marketCap_open: { $first: "$marketCap" },
            marketCap_high: { $max: "$marketCap" },
            marketCap_low: { $min: "$marketCap" },
            marketCap_close: { $last: "$marketCap" },
            liquidity_open: { $first: "$liquidity" },
            liquidity_high: { $max: "$liquidity" },
            liquidity_low: { $min: "$liquidity" },
            liquidity_close: { $last: "$liquidity" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $limit: ticksToFetch
        },
        {
          $project: {
            _id: 0,
            timestamp: "$_id",
            total_open: 1,
            total_high: 1,
            total_low: 1,
            total_close: 1,
            circulating_open: 1,
            circulating_high: 1,
            circulating_low: 1,
            circulating_close: 1,
            fdv_open: 1,
            fdv_high: 1,
            fdv_low: 1,
            fdv_close: 1,
            marketCap_open: 1,
            marketCap_high: 1,
            marketCap_low: 1,
            marketCap_close: 1,
            liquidity_open: 1,
            liquidity_high: 1,
            liquidity_low: 1,
            liquidity_close: 1,
            count: 1
          }
        }
      ];
    } else {
      pipeline = [
        {
          $match: {
            timestamp: { $gte: startTimestamp, $lte: latestTimestamp }
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $limit: ticksToFetch
        },
        {
          $sort: { timestamp: 1 }
        }
      ];
    }

    const historicalData = await TokenData.aggregate(pipeline);

    return NextResponse.json(historicalData);
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ message: 'Error fetching historical token data', error: errorMessage }, { status: 500 });
  }
}

function getGroupingInterval(timeFrame: string): { unit: string, binSize: number, milliseconds: number } {
  switch (timeFrame) {
    case '15m': return { unit: 'minute', binSize: 15, milliseconds: 15 * 60 * 1000 };
    case '1h': return { unit: 'hour', binSize: 1, milliseconds: 60 * 60 * 1000 };
    case '4h': return { unit: 'hour', binSize: 4, milliseconds: 4 * 60 * 60 * 1000 };
    case '1d': return { unit: 'day', binSize: 1, milliseconds: 24 * 60 * 60 * 1000 };
    case '1w': return { unit: 'week', binSize: 1, milliseconds: 7 * 24 * 60 * 60 * 1000 };
    case '1M': return { unit: 'month', binSize: 1, milliseconds: 30 * 24 * 60 * 60 * 1000 }; // Approximation
    default: return { unit: 'minute', binSize: 1, milliseconds: 60 * 1000 };
  }
}
