/*

用三种颜色蓝,红,灰色分别代表未接触,已传播,已衰退
每个个体有
传播阈值  按钮
衰退时间  
传播范围  电位器
扩散快慢  电位器
background  light-dependent resistor
网络密度    light-dependent resistor
(超级传播者)



*/
//arduino

let serial;
let sensorvalue = 0;//860~1200
let potvalue = 0;   //0~1023

//variable

let circles = [];
let type = ['blue','red','gray'] ;
let Diffusionrate = 1;      //扩散快慢
let Propagationvalue = 0;   //传播值
let thresholdvalue = 2;     //传播阈值
//let Informationnum = 1;     //信息源
let Networkdensity ;    //网络密度
let timeThreshold = 3000;   //时间阈值ms
let staretime = 0;          // 程序开始时间
let Decayprobability = 5;         //衰退概率
let canvasX,canvasY;

let graymaxradius = 100;    //传播范围
let expansionSpeed = 2;
let currentradius = 0;

let hasExecuted = false; 
let lastRedDisappearTime = null; //最后一个红球消失的时间
let lastUpdateTime = 0;


function setup() {

  canvasX = windowWidth;
  canvasY = windowHeight;
  // canvasX = 800;
  // canvasY = 800;
  createCanvas(canvasX, canvasY);
  staretime = millis();

  serial = new p5.SerialPort();
  serial.open("COM7"); 
  serial.on("data", gotData); // 当接收到数据时调用
  serial.on("error", gotError);


  generatecircles(10,1); 

  thresholdSlider = createSlider(1, 50, thresholdvalue, 1);
  thresholdSlider.position(20, 110); // 设置滑动条的位置
  thresholdSlider.style('width', '200px'); // 设置滑动条的宽度

  DecaySlider = createSlider(1, 50, Decayprobability, 1);
  DecaySlider.position(20, 150); // 设置滑动条的位置
  DecaySlider.style('width', '200px'); // 设置滑动条的宽度
 

  //初始选择一个红色小球
  let randomNumber = floor(random(1, 11)); 
  for (let circle1 of circles) {
    if (circle1.no === randomNumber) {
      circle1.color = type[1]; 
      circle1.redStartTime = millis(); // 记录变红时间
    }
  }
}



function draw() {

  Networkdensity = max(Networkdensity, 1); // Networkdensity >= 1
  Networkdensity = int(map(sensorvalue, 860, 1020, 1, 20)); 
  Diffusionrate = map(potvalue, 0, 1023, 0, 5);

  graymaxradius = map(potvalue, 0, 1023, 0, 200); 
  //只在密度发生变化时重新生成小球
  if (Networkdensity !== circles.length) {
    generatecircles(Networkdensity,Diffusionrate);
  }

  let backgroundvalue = map(sensorvalue, 860, 1020, 0, 1024)
  const backgroundColor = getBackgroundColor(backgroundvalue);
 
  background(backgroundColor.r, backgroundColor.g, backgroundColor.b);
  redaddrange();
  drawcircle();
  movecircle();
  // rangeinfluence();
  // updateRadius();
  bluetored();
  Informationsource();
  redtogray();
  
  //console.log(circles[0]);
  thresholdvalue = thresholdSlider.value()*10;
  Decayprobability = DecaySlider.value()*1000;
 
  fill(0);
  textSize(16);
  text(`Sensor Value: ${sensorvalue}`, 100, 30);
  text(`Pot Value: ${potvalue}`, 100, 50);
  text(`Threshold Value: ${thresholdvalue}`, 100, 80);
  text(`Decay Time: ${ Decayprobability}`, 100, 120);
 
  console.log("Networkdensity:",Networkdensity,"Diffusionrate:",Diffusionrate);
  //console.log("thresholdvalue:",thresholdvalue);


}
function gotData() {
  let data = serial.readLine(); // 从串口读取一行数据
  if (data.length > 0) {
    data = data.trim();
    console.log("Raw Data:", data);

    
    if (data.includes(",") && data.includes(":")) {
      let values = data.split(","); 
      values.forEach((pair) => {
        let [key, value] = pair.split(":"); 
        value = parseInt(value, 10); // 转换为整数

        if (!isNaN(value)) { // 确保值有效
          if (key === "S") {
            sensorvalue = constrain(value, 860, 1200); 
          } else if (key === "P") {
            potvalue = constrain(value, 0, 1023); 
          }
        } else {
          console.warn(`Invalid value for key ${key}:`, value);
        }
      });
    } else {
      console.warn("Malformed data received:", data); 
    }

    console.log("Sensor Value:", sensorvalue, "Pot Value:", potvalue);
  }
}


function gotError(err) {
  console.error("Serial Port Error:", err);
}



function generatecircles(num,speed){
  let Propagationprobability;   //传播概率
  let propagationrange = graymaxradius;         //传播范围
  Diffusionrate = speed;
  let no = num;

  circles = [];

  for(let i = 0; i < num; i++) {
    let circledata = {
      no:i+1,
      positonX:random(50,canvasX-50),
      positonY:random(50,canvasY-50),
      dx:random(-speed, speed), //x方向速度
      dy:random(-speed, speed), //y方向速度
      radius:50,
      staretime:staretime,
      Propagationprobability,
      Decayprobability:Decayprobability,
      propagationrange:graymaxradius,
      Diffusionrate:speed,
      Propagationvalue:Propagationvalue,
      color:type[0],
      startTime: millis(), 
      currentRadius: 0, 
      redStartTime: null  //变红的时间点
    };
    circles.push(circledata);
  }


}

function movecircle()
{ 
  for(let circle of circles)
  {
    circle.positonX += circle.dx;
    circle.positonY += circle.dy;

    if(circle.positonX - circle.radius < 0 || circle.positonX + circle.radius>canvasX)
    {
      circle.dx *= -1;
    }
    
    if (circle.positonY - circle.radius < 0 || circle.positonY + circle.radius > canvasY) 
    {
      circle.dy *= -1; 
    }
  }

}


function drawcircle()
{
  for(let circle of circles)
  {
    for(let i = 0; i < Networkdensity; i++)
    {
    fill(circle.color);
    ellipse(circle.positonX,circle.positonY,circle.radius);
    
    fill(0);
    textAlign(CENTER, CENTER);
    text(circle.no, circle.positonX, circle.positonY);
    }
  }
}

function rangeinfluence(circle)
{
  noFill(); 
  strokeWeight(2);

  stroke(200); 
  ellipse(circle.positonX, circle.positonY, circle.currentRadius * 2);

  if (circle.currentRadius > graymaxradius * 0.6) {
    stroke(150); 
    ellipse(circle.positonX, circle.positonY, circle.currentRadius * 0.8 * 2);
  }

  if (circle.currentRadius > graymaxradius * 0.3) {
    stroke(100); 
    ellipse(circle.positonX, circle.positonY, circle.currentRadius * 0.5 * 2);
  }
}

function updateRadius(circle) {
  circle.currentRadius += expansionSpeed; 
  if (circle.currentRadius > graymaxradius) {
    circle.currentRadius = 0; 
  }
}

function redaddrange()
{
  circles.forEach(circle => {
    if (circle.color === type[1]) {
      rangeinfluence(circle);
      updateRadius(circle);
    }
  });
}

function bluetored() {
  for (let circle1 of circles) {
    if (circle1.color === type[0]) {  // 如果是蓝色圆圈
      for (let circle2 of circles) {
        if (circle2.color === type[1]) // 寻找红色圆圈
          {  
            let distance = dist(
              circle1.positonX, 
              circle1.positonY, 
              circle2.positonX, 
              circle2.positonY
            );
          
          if (distance < graymaxradius) 
            {
              let currentTime = millis();
              let elapsedTime = currentTime - circle1.startTime;
              
              if(elapsedTime >= timeThreshold)
                {
                  circle1.Propagationvalue += 1;
                }
            }
          }
            
          if (circle1.Propagationvalue >= thresholdvalue) {
            circle1.color = type[1];
            circle1.redStartTime = millis();   // 记录变红的时间点
            console.log("thresholdvalue",thresholdvalue);
          }
        }
      }
    }
  }


function Informationsource() {
  // 检查是否存在红色小球
  let hasRedCircle = circles.some(circle => circle.color === type[1]); 
  if (!hasRedCircle) {
    
    if (lastRedDisappearTime === null) { 
      lastRedDisappearTime = millis(); // 记录红球消失的时间
      console.log("场上没有红色球了,准备重置...");
    }

    // 检查是否所有蓝色小球已重置完成
    let allBlue = circles.every(circle => circle.color === type[0]);

    // 如果所有小球已重置为蓝色
    if (allBlue) { 
      console.log("所有小球已重置为蓝色，随机选择一个变为红色...");
      let randomNumber = floor(random(1, Networkdensity + 1)); // 随机选择一个小球编号
      for (let circle1 of circles) {
        if (circle1.no === randomNumber) {
          circle1.color = type[1]; 
          circle1.redStartTime = millis(); 
        }
      }
      lastRedDisappearTime = null; 
      hasExecuted = true;
    }
  }
}



function redtogray() {
  let currentTime = millis();
  
  for (let circle of circles) {
    if (circle.color === type[1] && circle.redStartTime) {
      let elapsedTime = currentTime - circle.redStartTime;  // 计算变红后经过的时间
      
      if (elapsedTime >= Decayprobability)//衰退概率  
        circle.color = type[2];  
         
      }
    }
  }

function getBackgroundColor(sensorValue) {
  let r, g, b;

  if (sensorValue < 300) {
    // 夜晚阶段（深蓝到浅蓝，降低饱和度）
    r = map(sensorValue, 0, 300, 40, 80); 
    g = map(sensorValue, 0, 300, 40, 90); 
    b = map(sensorValue, 0, 300, 90, 150); 
  } else if (sensorValue < 700) {
    // 黄昏阶段（浅蓝到橙黄，降低饱和度）
    r = map(sensorValue, 300, 700, 120, 220); 
    g = map(sensorValue, 300, 700, 100, 140); 
    b = map(sensorValue, 300, 700, 150, 90); 
  } else {
    // 白天阶段（橙黄到白色，接近中性色调）
    r = map(sensorValue, 700, 1023, 220, 255); 
    g = map(sensorValue, 700, 1023, 140, 240); 
    b = map(sensorValue, 700, 1023, 90, 230); 
  }
  return { r, g, b };

}
