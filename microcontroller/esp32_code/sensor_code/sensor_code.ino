#include <HX711_ADC.h>

const int HX711_dout = 13; 
const int HX711_sck  = 12;  

HX711_ADC LoadCell(HX711_dout, HX711_sck);

unsigned long lastPrint = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("HX711 Load Cell Setup...");

  LoadCell.begin();
  LoadCell.start(2000);
  LoadCell.setCalFactor(1.6); 

  Serial.println("Taring (remove any weight)...");
  LoadCell.tare();  
  Serial.println("Tare complete!");
}

void loop() {
  LoadCell.update();

  if (millis() - lastPrint > 1000) {
    float weight = LoadCell.getData();
    Serial.print("Reading: ");
    Serial.print(weight, 2);
    Serial.println(" units");
    lastPrint = millis();
  }
}
