import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);
    return NextResponse.json(
      { message: 'Data received successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to receive or process data' },
      { status: 500 },
    );
  }
}
export async function GET() {
  return NextResponse.json([], { status: 200 });
}
