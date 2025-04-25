import { NextResponse } from 'next/server';

let previousTotalAccel: number | null = null;
interface SensorData {
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  vibration: boolean;
  latitude: number;
  longitude: number;
  speed: number;
  altitude: number;
  satellites: number;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Extract sensor data from query parameters
    const sensorData: Partial<SensorData> = {};
    for (const [key, value] of params.entries()) {
      if (key === 'accelerationX' || key === 'accelerationY' || key === 'accelerationZ' || key === 'latitude' || key === 'longitude' || key === 'speed' || key === 'altitude' || key === 'satellites') {
        sensorData[key as keyof SensorData] = parseFloat(value);
      } else if (key === 'vibration') {
          sensorData[key as keyof SensorData] = value.toLowerCase() === 'true';
      }
    }

    // Destructure values from sensorData
    const { accelerationX, accelerationY, accelerationZ } = sensorData;


    if(accelerationX === undefined || accelerationY === undefined || accelerationZ === undefined){
        throw new Error("invalid data");
    }

    // Calculate total acceleration
    const totalAccel = Math.abs(accelerationX) + Math.abs(accelerationY) + Math.abs(accelerationZ);

    // Calculate da/dt 
    let dadt = 0; 
    if (previousTotalAccel !== null) {
      dadt = totalAccel - previousTotalAccel;
    }
    previousTotalAccel = totalAccel;

      // Create the payload to return
    const payload = {
      ...sensorData,
      totalAccel,
      dadt,
    };

    console.log("Received data:", sensorData);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to receive or process data' },
      { status: 500 },
    );
  }
}
