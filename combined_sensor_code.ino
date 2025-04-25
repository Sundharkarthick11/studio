#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <MPU6050.h>

// WiFi credentials
const char* ssid = "Virus_31";
const char* password = "fbhb6463";

// Server details
const char* serverName = "https://studio-mu.vercel.app/api/sensor-data-2/";

// MPU6050
MPU6050 mpu;
float accelX_offset = 0, accelY_offset = 0, accelZ_offset = 0;

// Previous total acceleration and time
float prevAccel = 0;
unsigned long prevTime = 0;

// da/dt threshold
float threshold_dadt = 20.0;

// Vibration sensor
const int vibrationPin = 4;
bool vibrationDetected = false;

// GPS
#define RXD2 16
#define TXD2 17
#define GPS_BAUD 9600
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

void initMPU6050() {
    Wire.begin(21, 22);
    mpu.initialize();
    if (!mpu.testConnection()) {
        Serial.println("MPU6050 connection failed!");
        while (1);
    }
    Serial.println("MPU6050 connected.");
}

void calibrateMPU() {
    Serial.println("Calibrating MPU6050...");
    int16_t ax, ay, az;
    float sumX = 0, sumY = 0, sumZ = 0;
    int numSamples = 500;

    for (int i = 0; i < numSamples; i++) {
        mpu.getAcceleration(&ax, &ay, &az);
        sumX += ax;
        sumY += ay;
        sumZ += az;
        delay(5);
    }

    accelX_offset = sumX / numSamples;
    accelY_offset = sumY / numSamples;
    accelZ_offset = (sumZ / numSamples) - 16384;

    Serial.println("Calibration complete!");
}

bool readVibrationData() {
    return digitalRead(vibrationPin) == LOW;
}

void setup() {
    Serial.begin(115200);
    
    pinMode(vibrationPin, INPUT_PULLUP);

    // WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("Connected!");

    // MPU6050
    initMPU6050();
    calibrateMPU();

    // GPS
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);

    // Initialize previous values
    prevTime = millis();
}

void loop() {
    // Read MPU6050 data
    int16_t ax, ay, az;
    mpu.getAcceleration(&ax, &ay, &az);

    // Apply calibration offsets
    ax -= accelX_offset;
    ay -= accelY_offset;
    az -= accelZ_offset;

    // Convert to m/s²
    float accelX = (ax / 16384.0) * 9.81;
    float accelY = (ay / 16384.0) * 9.81;
    float accelZ = (az / 16384.0) * 9.81;

    // Compute total acceleration magnitude
    float totalAccel = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);

    // Compute da/dt
    unsigned long currentTime = millis();
    float dt = (currentTime - prevTime) / 1000.0;
    float dadt = 0;
    if (dt > 0) {
        dadt = abs((totalAccel - prevAccel) / dt);
    }

    // Check for sudden changes in acceleration
    if (dadt > threshold_dadt && totalAccel < 5.0) {
        Serial.println("⚠️ Sudden da/dt change detected! Object stopped abruptly.");
    }
   // Read GPS data
    while (gpsSerial.available() > 0) {
        if (gps.encode(gpsSerial.read())) {
          
        }
    }
   
   // Read vibration data
    vibrationDetected = readVibrationData();

    // Create JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"accelerationX\":" + String(accelX) + ",";
    jsonPayload += "\"accelerationY\":" + String(accelY) + ",";
    jsonPayload += "\"accelerationZ\":" + String(accelZ) + ",";
    jsonPayload += "\"totalAccel\":" + String(totalAccel) + ",";
    jsonPayload += "\"dadt\":" + String(dadt) + ",";
    jsonPayload += "\"vibration\":" + String(vibrationDetected) + ",";
    jsonPayload += "\"latitude\":" + String(gps.location.lat(), 6) + ",";
    jsonPayload += "\"longitude\":" + String(gps.location.lng(), 6) + ",";
    jsonPayload += "\"speed\":" + String(gps.speed.kmph()) + ",";
    jsonPayload += "\"altitude\":" + String(gps.altitude.meters()) + ",";
    jsonPayload += "\"satellites\":" + String(gps.satellites.value());
    jsonPayload += "}";

    // Send data to server
    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverName);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String response = http.getString();
        Serial.println(response);
    } else {
        Serial.print("Error sending POST request: ");
        Serial.println(httpResponseCode);
    }
    http.end();

    // Update previous values
    prevAccel = totalAccel;
    prevTime = currentTime;

    delay(5000); // Send data every 5 seconds
}