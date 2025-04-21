#include <WiFi.h>
#include <HTTPClient.h>
#include "time.h"

// WiFi credentials
const char* ssid = "Redmi";
const char* password = "qkaparola";

// NTP config
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 10800;     // UTC+3 for Bulgaria
const int daylightOffset_sec = 0;

// Meal times (hour:minute)
const int mealTimes[][2] = {
  {6, 0},
  {12, 0},
  {18, 0}
};

// Last request time
int lastSentHour = -1;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to WiFi
  Serial.println("Connecting with WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Sync time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time sync...");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    delay(1000);
  }
  Serial.println("Time synchronized.");
}

void loop() {
  // Manual test trigger via Serial Monitor
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // remove whitespace/newline

    if (command == "test") {
      Serial.println("Manual test triggered via Serial.");
      sendMealRequest();
    }
  }

  // Get current time
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to get time.");
    delay(1000);
    return;
  }

  int currentHour = timeinfo.tm_hour;
  Serial.printf("Current hour: %02d\n", currentHour);

  // Check if it's time to send the meal request
  for (int i = 0; i < 3; i++) {
    if (currentHour == mealTimes[i][0]) {
      if (lastSentHour != currentHour) {
        sendMealRequest();
        lastSentHour = currentHour;
      } else {
        Serial.println("Already sent request this hour.");
      }
    }
  }

  delay(60000);  // check every 1 minute
}

void sendMealRequest() {
  HTTPClient http;
  String url = "http://iva.tolisoft.net:3050/feeders/1/next-portion";
  http.begin(url);

  Serial.print("Sending request to: ");
  Serial.println(url);

  int httpCode = http.GET();

  if (httpCode > 0) {
    Serial.printf("HTTP request successful! HTTP status code: %d\n", httpCode);
    String payload = http.getString();
    Serial.println("Server response:");
    Serial.println(payload);
  } else {
    Serial.printf("Error with GET: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}