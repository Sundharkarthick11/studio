# SensorStats

This is a NextJS starter in Firebase Studio for visualizing real-time sensor data.

## Core Features:

-   Real-time Data Display: Displays real-time sensor data (acceleration, vibration, GPS) in a tabular format.
-   Data Export: Allows users to download sensor data as a CSV file for offline analysis.
-   Data Visualization: Visualizes sensor data using interactive charts (e.g., line graphs for acceleration, vibration, GPS coordinates).

## Arduino Code for ESP32:

Below is the Arduino code for reading data from the sensors (MPU6050 acceleration sensor, SW420 vibration sensor, GPS module) with ESP32 and sending it to the web application using HTTP requests.

```arduino
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <TinyGPS++.h>

// MPU6050 Address
const int MPU6050_ADDR = 0x68;

// Define the RX and TX pins for Serial 2 (GPS)
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600

// WiFi credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// Web server address (replace with your Next.js app's API endpoint)
const char* serverName = "http://your_nextjs_app_url/api/sensor-data";

// Variables for MPU6050
float AccX, AccY, AccZ;

// Variables for SW420
int vibrationPin = 4; // Digital pin connected to SW420
bool vibrationDetected = false;

// GPS instance
TinyGPSPlus gps;

// GPS Serial
HardwareSerial gpsSerial(2);

// Function to initialize MPU6050
void initMPU6050() {
  Wire.begin();
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B);  // PWR_MGMT_1 register
  Wire.write(0);     // Set to zero (wakes up the MPU6050)
  Wire.endTransmission(true);
}

// Function to read acceleration data from MPU6050
void readMPU6050Data() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B); // starting with register 0x3B (ACCEL_XOUT_H)
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 6, true); // request a total of 6 registers
  AccX = (Wire.read() << 8 | Wire.read()) / 16384.0;
  AccY = (Wire.read() << 8 | Wire.read()) / 16384.0;
  AccZ = (Wire.read() << 8 | Wire.read()) / 16384.0;
}

// Function to read vibration data from SW420
void readVibrationData() {
  vibrationDetected = digitalRead(vibrationPin) == LOW;
}

void setup() {
  Serial.begin(115200);

  // Initialize MPU6050
  initMPU6050();

  // Set vibration pin as input
  pinMode(vibrationPin, INPUT_PULLUP);

  // GPS Serial
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected to WiFi, IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read sensor data
  readMPU6050Data();
  readVibrationData();

  // GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  float latitude = gps.location.lat();
  float longitude = gps.location.lng();
  float speed = gps.speed.kmph();
  float altitude = gps.altitude.meters();
  int satellites = gps.satellites.value();

  // Create JSON payload
  String payload = "{";
  payload += "\"accelerationX\": " + String(AccX) + ",";
  payload += "\"accelerationY\": " + String(AccY) + ",";
  payload += "\"accelerationZ\": " + String(AccZ) + ",";
  payload += "\"vibration\": " + String(vibrationDetected) + ",";
  payload += "\"latitude\": " + String(latitude, 6) + ",";
  payload += "\"longitude\": " + String(longitude, 6) + ",";
  payload += "\"speed\": " + String(speed) + ",";
  payload += "\"altitude\": " + String(altitude) + ",";
  payload += "\"satellites\": " + String(satellites) + "}";

  // Send HTTP request
  WiFiClient client;
  HTTPClient http;

  http.begin(client, serverName);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error sending HTTP request: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();

  delay(5000); // Send data every 5 seconds
}
```

**Important Considerations:**

*   Replace `"your_SSID"` and `"your_PASSWORD"` with your actual WiFi credentials.
*   Replace `"http://your_nextjs_app_url/api/sensor-data"` with the actual URL of your Next.js app's API endpoint.
*   Ensure your ESP32 has the necessary libraries installed (`WiFi`, `HTTPClient`, `Wire`, `TinyGPS++`).  You can install these through the Arduino IDE's Library Manager.
*   This code sends data in JSON format.  Make sure your Next.js API endpoint is set up to receive and parse JSON data.
*   Error handling: the provided Arduino code has rudimentary error handling. Improve error handling for production.
*   Power consumption: consider the power consumption of the ESP32 and sensors when deploying this solution.

## Next.js API Endpoint:

You'll need to create an API endpoint in your Next.js application to receive the data from the ESP32. Create a file named `src/app/api/sensor-data/route.ts` with the following content:

```typescript
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
```

## Connecting the Web App to ESP32:

1.  **Set up the Arduino code:**  Upload the Arduino code to your ESP32.
2.  **Configure WiFi:**  Make sure the ESP32 can connect to your WiFi network.
3.  **Deploy the Next.js app:**  Deploy your Next.js app to a hosting platform (e.g., Vercel, Netlify) or run it locally.
4.  **Test the connection:**  Verify that the ESP32 is sending data to your Next.js app and that the data is being displayed correctly in the web interface.

## Next Steps:

*   Implement error handling in the Arduino code.
*   Secure the API endpoint in your Next.js application.
*   Store the sensor data in a database for historical analysis.
*   Implement user authentication and authorization to control access to the data.

This extended documentation provides a comprehensive guide to connecting your web application to the ESP32 and reading real-time data from the sensors. Remember to replace the placeholder values with your actual credentials and URL.
