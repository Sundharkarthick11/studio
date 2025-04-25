import { NextResponse } from 'next/server';

let previousTotalAccel: number | null = null;

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { accelerationX, accelerationY, accelerationZ } = data;

    // Calculate total acceleration
    const totalAccel = Math.abs(accelerationX) + Math.abs(accelerationY) + Math.abs(accelerationZ);

    // Calculate da/dt
    let dadt = 0; // Default to 0 if no previous data
    if (previousTotalAccel !== null) {
      dadt = totalAccel - previousTotalAccel;
    }
    previousTotalAccel = totalAccel;


    const payload = {
        ...data,
        totalAccel,
        dadt,
      };

    console.log("Received data:", payload);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to receive or process data' },
      { status: 500 },
    );
  }
}
