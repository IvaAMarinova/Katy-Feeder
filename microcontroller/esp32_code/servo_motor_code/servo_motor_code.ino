#include <WiFi.h>
#include <HTTPClient.h>
#include "time.h"
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>


const char* ssid = ""; //wifi ime
const char* password = ""; //wifi parola


const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 10800;
const int daylightOffset_sec = 0;


Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);
const int SERVO_CHANNEL = 0;
const int SERVO_MIN = 130;
const int SERVO_MAX = 550;


const int gramsPerCycle = 1;  
const int rotationAngle = 90; 


unsigned long lastRequestTime = 0;
const unsigned long requestInterval = 5000; //5secs
//const unsigned long requestInterval = 10 * 60 * 1000;  10mins


const String requestURL_ORIGINAL = "http://iva.tolisoft.net:3050/esp/commands/feeder/1";
const String requestURL_DEBUG    = "http://iva.tolisoft.net:3050/esp/commands/feeder/1?debug=true";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  unsigned long wifiStart = millis();
  const unsigned long wifiTimeout = 15000; 

  while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < wifiTimeout) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n Failed to connect to WiFi!");
    delay(5000);
    while (true) {
      delay(1000);  
    }
    //ESP.restart(); 
  }

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time...");
  struct tm timeinfo;
  unsigned long ntpStart = millis();
  const unsigned long ntpTimeout = 10000;

  while (!getLocalTime(&timeinfo) && millis() - ntpStart < ntpTimeout) {
    Serial.println("NTP sync failed.");
    delay(1000);
  }

  if (getLocalTime(&timeinfo)) {
    Serial.println("Time synchronized!");
  } else {
    Serial.println(" NTP failed after timeout.");
  }

  Wire.begin(14, 15);
  pwm.begin();
  pwm.setPWMFreq(50);
  delay(10);
  Serial.println("PCA9685 initialized.");
}


void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    if (input == "r") {
      Serial.println("[Manual DEBUG Trigger] Sending request to DEBUG URL...");
      fetchCommandAndAct(requestURL_DEBUG);
    }
    else if (input == "o") {
      Serial.println("[Manual ORIGINAL Trigger] Sending request to ORIGINAL URL...");
      fetchCommandAndAct(requestURL_ORIGINAL);
    }
  }

  
  if (millis() - lastRequestTime >= requestInterval) {
    Serial.println("[Auto Trigger] Sending request to ORIGINAL URL...");
    fetchCommandAndAct(requestURL_ORIGINAL);
    lastRequestTime = millis();
  }

  delay(1000);
}

void fetchCommandAndAct(const String& url) {
  HTTPClient http;
  Serial.println("Requesting from: " + url);

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode > 0) {
    Serial.printf("HTTP %d received\n", httpCode);
    String payload = http.getString();
    Serial.println("Payload: " + payload);

    String action = "";
    int grams = 0;

    // Parse "action"
    int actionKey = payload.indexOf("\"action\"");
    if (actionKey != -1) {
      int quote1 = payload.indexOf("\"", actionKey + 8);
      int quote2 = payload.indexOf("\"", quote1 + 1);
      action = payload.substring(quote1 + 1, quote2);
    }

    // Parse "grams" if exists
    if (payload.indexOf("\"grams\"") != -1) {
      int gramsColon = payload.indexOf(":", payload.indexOf("\"grams\""));
      int end = payload.indexOf("}", gramsColon);
      String gramsStr = payload.substring(gramsColon + 1, end);
      gramsStr.trim();
      grams = gramsStr.toInt();
    }

    Serial.printf("→ Action: '%s', Grams: %d\n", action.c_str(), grams);

/////

      if (action == "dispense" && grams > 0) {
        Serial.printf("→ Starting dispense for %d grams (5g per cycle)\n", grams);

        int cycleCount = 0;
        while (grams > 0) {
          cycleCount++;
          Serial.printf("→ Cycle %d | Remaining grams: %d\n", cycleCount, grams);

          moveServoToDegrees(rotationAngle); 
          delay(400);
          moveServoToDegrees(0);             
          delay(400);

          grams -= 5;
        }

        Serial.println("→ Dispensing complete.");
      } else if (action == "none") {
      Serial.println("→ Action is 'none'. Skipping movement.");
    } else {
      Serial.println("→ Unknown action or invalid data.");
    }

  } else {
    Serial.printf("HTTP GET failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void moveServoToDegrees(int degree) {
  degree = constrain(degree, 0, 180);
  int pulse = map(degree, 0, 180, SERVO_MIN, SERVO_MAX);
  Serial.printf(" → Moving servo to %d° → pulse %d\n", degree, pulse);
  pwm.setPWM(SERVO_CHANNEL, 0, pulse);
}