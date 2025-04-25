#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;
float accelX_offset = 0, accelY_offset = 0, accelZ_offset = 0;

float prevAccel = 0;  // Previous acceleration magnitude
unsigned long prevTime = 0;  // Previous timestamp

float threshold_dadt = 20.0;  // Adjust based on testing

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);
    mpu.initialize();

    if (!mpu.testConnection()) {
        Serial.println("MPU6050 connection failed!");
        while (1);
    }
    Serial.println("MPU6050 connected.");

    calibrateMPU();
    prevTime = millis();  // Initialize time
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

void loop() {
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

    // Compute da/dt (rate of change of acceleration)
    unsigned long currentTime = millis();
    float dt = (currentTime - prevTime) / 1000.0;  // Convert to seconds

    if (dt > 0) {
        float dadt = abs((totalAccel - prevAccel) / dt);

        Serial.print("Acceleration: ");
        Serial.print(totalAccel);
        Serial.print(" m/s², da/dt: ");
        Serial.print(dadt);
        Serial.println(" m/s³");

        // Check for sudden change in acceleration (high slope)
        if (dadt > threshold_dadt && totalAccel < 5.0) {  // Object slowing down and near stop
            Serial.println("⚠️ Sudden da/dt change detected! Object stopped abruptly.");
        }

        // Update previous values
        prevAccel = totalAccel;
        prevTime = currentTime;
    }

    delay(1000);  // Small delay for real-time response
}