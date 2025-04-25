# **App Name**: SensorStats

## Core Features:

- Real-time Data Display: Display real-time sensor data (acceleration, vibration, GPS) in a tabular format.
- Data Export: Allow users to download sensor data as a CSV file for offline analysis.
- Data Visualization: Visualize sensor data using interactive charts (e.g., line graphs for acceleration, vibration, GPS coordinates).

## Style Guidelines:

- Primary color: Dark blue (#1A237E) for a professional and data-focused feel.
- Secondary color: Light gray (#EEEEEE) for backgrounds and content separation.
- Accent: Teal (#009688) to highlight interactive elements and data points.
- Clean, data-driven layout with clear sections for real-time data, charts, and export options.
- Use simple, consistent icons to represent sensor types and data functions.

## Original User Request:
I need a web app to get the real-time data from the sensors (MPU6050 acceleration sensor, SW420 vibration sensor, GPS module) with ESP32. in that web page, the Realtime data are stored and able to download and analysis the data (plot the graph). i will give you the Arduino code for all sensor, integrate them, give me the workflow and need code for this project..
GPS with esp32 code:
#include <TinyGPS++.h>

// Define the RX and TX pins for Serial 2
#define RXD2 16
#define TXD2 17

#define GPS_BAUD 9600

// Create TinyGPS++ object
TinyGPSPlus gps;

// Create a HardwareSerial instance for Serial 2
HardwareSerial gpsSerial(2);

void setup() {
  // Start Serial Monitor
  Serial.begin(115200);
  
  // Start GPS Serial communication
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
  Serial.println("Serial 2 started at 9600 baud rate");
}

void loop() {
  unsigned long start = millis();

  while (millis() - start < 1000) { // Read GPS data for 1 second
    while (gpsSerial.available() > 0) {
      gps.encode(gpsSerial.read());
    }
    if (gps.location.isUpdated()) { // Check if GPS has new data
      float latitude = gps.location.lat();
      float longitude = gps.location.lng();

      Serial.print("LAT: ");
      Serial.println(latitude, 6);
      Serial.print("LONG: "); 
      Serial.println(longitude, 6);
      Serial.print("SPEED (km/h): "); 
      Serial.println(gps.speed.kmph());
      Serial.print("ALT (meters): "); 
      Serial.println(gps.altitude.meters());
      Serial.print("Satellites: "); 
      Serial.println(gps.satellites.value());
      Serial.print("Time (UTC): ");
      Serial.print(gps.date.year());
      Serial.print("/");
      Serial.print(gps.date.month());
      Serial.print("/");
      Serial.print(gps.date.day());
      Serial.print(" ");
      Serial.print(gps.time.hour());
      Serial.print(":");
      Serial.print(gps.time.minute());
      Serial.print(":");
      Serial.println(gps.time.second());

      // Generate Google Maps Link
      Serial.print("Google Maps Link: ");
      Serial.println("https://www.google.com/maps/place/" + String(latitude, 6) + "," + String(longitude, 6));

      Serial.println("");
    }
  }
}
mpu6050 with esp32 in firebase (remove the firebase syntax)
  