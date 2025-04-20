#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Redmi";          
const char* password = "qkaparola";   

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Connecting with WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Connected!");

  if (WiFi.status() != WL_CONNECTED) {
  Serial.println("WiFi not connected!");
  return;
}

  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  HTTPClient http;
  http.begin("http://iva.tolisoft.net:5173/");  
  int httpCode = http.GET();

  String url = "http://iva.tolisoft.net:5173/";
  Serial.print("Connecting to ");
  Serial.println(url);

  if (httpCode > 0) {
    Serial.printf("HTTP request successful! HTTP status code: %d\n", httpCode);
    String payload = http.getString();
    Serial.println("Server answer:");
    Serial.println(payload);
  } else {
    Serial.printf("Error with GET: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void loop() {
  // Nothing here
}
