#include <HX711_ADC.h>


const int HX711_dout = 13; 
const int HX711_sck = 12;  

HX711_ADC LoadCell(HX711_dout, HX711_sck);

unsigned long t = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("Starting...");

  LoadCell.begin();
  LoadCell.start(2000);  // startup time
  LoadCell.setCalFactor(1.6);  // Initial guess for calibration factor

  Serial.println("Startup complete.");
  Serial.println("Place a known weight to calibrate.");
}

void loop() {
  LoadCell.update();

  if (millis() > t + 500) {
    float reading = LoadCell.getData();
    Serial.print("Reading: ");
    Serial.println(reading, 1); // You’ll adjust this output manually later
    t = millis();
  }
}
