#include <WiFi.h>
#include <HTTPClient.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// WiFi credentials
const char* ssid = "Redmi";
const char* password = "qkaparola";

// NTP config
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 10800;  // UTC+3 for Bulgaria
const int daylightOffset_sec = 0;

// Meal times
const int mealTimes[][2] = {
  {6, 0},
  {12, 0},
  {18, 0}
};

int lastSentHour = -1;

// Servo setup
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);
const int SERVO_CHANNEL = 0;
const int SERVO_MIN = 130;
const int SERVO_MAX = 550;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Time sync
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time...");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    Serial.println("NTP sync failed.");
    delay(1000);
  }
  Serial.println("Time synchronized!");

  // Initialize PCA9685
  Wire.begin(14, 15);
  pwm.begin();
  pwm.setPWMFreq(50);
  delay(10);
  Serial.println("PCA9685 initialized.");
}

void loop() {
  // Manual test via Serial input
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input == "r") {
      Serial.println("[Manual Trigger] Fetching grams...");
      fetchGramsAndDispense();
    }
  }

  // Time-based check
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to get time.");
    delay(1000);
    return;
  }

  int hour = timeinfo.tm_hour;
  int minute = timeinfo.tm_min;
  Serial.printf("Time now: %02d:%02d\n", hour, minute);

  for (int i = 0; i < 3; i++) {
    if (hour == mealTimes[i][0] && minute == mealTimes[i][1]) {
      if (lastSentHour != hour) {
        Serial.println("[Auto Trigger] Scheduled meal time.");
        fetchGramsAndDispense();
        lastSentHour = hour;
      } else {
        Serial.println("Request already sent for this hour.");
      }
    }
  }

  delay(10000); // Check every 10 seconds
}

void fetchGramsAndDispense() {
  HTTPClient http;
  String url = "http://iva.tolisoft.net:3050/feeders/1/next-portion";
  Serial.println("Requesting from: " + url);

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode > 0) {
    Serial.printf("HTTP %d received\n", httpCode);
    String payload = http.getString();
    Serial.println("Payload: " + payload);

    // Manually extract the number from {"grams":47}
    int grams = -1;

    int startIndex = payload.indexOf(":");
    int endIndex = payload.indexOf("}");

    if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
      String gramsStr = payload.substring(startIndex + 1, endIndex);
      gramsStr.trim();
      grams = gramsStr.toInt();
    }

    if (grams > 0 && grams < 100) {
      int targetDegrees = grams * 2;
      Serial.printf("Dispensing %d grams (%d°)\n", grams, targetDegrees);
      moveServoToDegrees(targetDegrees);
    } else {
      Serial.println("Invalid or missing 'grams' value.");
    }

  } else {
    Serial.printf("HTTP GET failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}


void moveServoToDegrees(int degree) {
  degree = constrain(degree, 0, 180);
  int targetPulse = map(degree, 0, 180, SERVO_MIN, SERVO_MAX);
  Serial.printf(" → Moving to %d° → pulse %d\n", degree, targetPulse);

  pwm.setPWM(SERVO_CHANNEL, 0, targetPulse);
  delay(1000);

  Serial.println(" → Returning to 0°");
  pwm.setPWM(SERVO_CHANNEL, 0, SERVO_MIN);
  delay(1000);
}
