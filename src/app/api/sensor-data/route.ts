import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Log the received data
    console.log('Received sensor data:', data);

    // Process the data (e.g., store it in a database)
    // ...

    return NextResponse.json({ message: 'Data received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing sensor data:', error);
    return NextResponse.json({ error: 'Failed to receive data' }, { status: 500 });
  }
}
