

int sensorpin = A0;
int sensorvalue = 0;

void setup() {
  Serial.begin(9600);


}

void loop() {

  sensorvalue = analogRead(sensorpin); 
  Serial.println(sensorvalue); 
  


  delay(100); 
  

}
