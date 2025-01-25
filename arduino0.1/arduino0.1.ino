

int sensorpin = A0;
int potpin = A1;
int sensorvalue = 0;
int potvalue = 0;

void setup() {
  Serial.begin(9600);


}

void loop() {

  sensorvalue = analogRead(sensorpin);
  potvalue = analogRead(potpin);

  Serial.print("S:");  // 标记 sensorvalue
  Serial.print(sensorvalue);
  Serial.print(",P:"); // 标记 potvalue
  Serial.println(potvalue);
  


  delay(100); 
  

}
