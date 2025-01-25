/*
用三种颜色蓝,红,灰色分别代表未接触,已传播,已衰退
每个个体有
阈值代表被影响的程度
传播概率
衰退概率
传播范围
扩散快慢
网络密度
(超级传播者)



*/
//arduino

let serial;
let sensorvalue = 0;//860~1200

//variable

let circles = [];
let type = ['blue','red','gray'] ;
let Diffusionrate = 1;      //扩散快慢
let Propagationvalue = 0;   //传播值
let thresholdvalue = 2;     //传播阈值
let Informationnum = 1;     //信息源
let Networkdensity ;    //网络密度
let timeThreshold = 3000;   //时间阈值ms
let staretime = 0;          // 程序开始时间
let Decayprobability = 5000;         //衰退概率
let canvasX,canvasY;

let graymaxradius = 100;    //传播范围
let expansionSpeed = 2;
let currentradius = 0;

let hasExecuted = false; 
let lastRedDisappearTime = null; //最后一个红球消失的时间
let lastUpdateTime = 0;

// let shouldUpdateCircles = false;
// let updateInterval = 5000;


function setup() {

  canvasX = windowWidth;
  canvasY = windowHeight;
  // canvasX = 800;
  // canvasY = 800;
  createCanvas(canvasX, canvasY);
  generatecircles();
  staretime = millis();

  //Networkdensity = map(sensorvalue,860,1020,10,50,true);
  //Networkdensity = int((sensorvalue - 850)/10);
  


  serial = new p5.SerialPort();
  serial.open("COM7"); 
  serial.on("data", gotData); // 当接收到数据时调用
  serial.on("error", gotError); // 当发生错误时调用

  generatecircles(10); // 初始化生成小球
  // [改动1]: 初始选择一个红色小球
  let randomNumber = floor(random(1, 11)); // 假设初始有 10 个小球
  for (let circle1 of circles) {
    if (circle1.no === randomNumber) {
      circle1.color = type[1]; // 将一个小球设为红色
      circle1.redStartTime = millis(); // 记录变红时间
    }
  }
}



function draw() {

  Networkdensity=10;
  

 
  background(240);
  redaddrange();
  drawcircle();
  movecircle();
  // rangeinfluence();
  // updateRadius();
  bluetored();
  Informationsource();
  redtogray();
  
  //console.log(circles[0]);

 
  
  fill(0);
  textSize(16);
  text(`Sensor Value: ${sensorvalue}`, 20, 30);
  console.log(sensorvalue);
  console.log(Networkdensity);



}
function gotData() {
  let data = serial.readLine(); // 从串口读取一行数据
  if (data.length > 0) {
    sensorvalue = int(data.trim()); // 将数据转换为整数
    console.log("Received:", sensorvalue);
    
  }
}

function gotError(err) {
  console.error("Serial Port Error:", err);
}



function generatecircles(Networkdensity){
  let Propagationprobability;   //传播概率
  let propagationrange = graymaxradius;         //传播范围
  
  let no = Networkdensity;

  circles = [];

  for(let i = 0; i < Networkdensity; i++) {
    let circledata = {
      no:i+1,
      positonX:random(50,canvasX-50),
      positonY:random(50,canvasY-50),
      dx:random(-Diffusionrate, Diffusionrate), //x方向速度
      dy:random(-Diffusionrate, Diffusionrate), //y方向速度
      radius:50,
      staretime:staretime,
      Propagationprobability,
      Decayprobability:Decayprobability,
      propagationrange:graymaxradius,
      Diffusionrate:Diffusionrate,
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
          }
        }
      }
    }
  }


// function Informationsource() { 
//   let hasRedCircle = circles.some(circle => circle.color === type[1]);
  
//   if (!hasRedCircle) {
//     if (lastRedDisappearTime === null) {
//       lastRedDisappearTime = millis(); // 记录红球消失时间
//       console.log("场上没有红色球了,等待5秒后重置...");
//     }
    
//     if (!hasExecuted) { // 执行一次初始红色球
//       let randomNumber = floor(random(1, Networkdensity + 1));
//       for (let circle1 of circles) {
//         if(circle1.no === randomNumber) {
//           circle1.color = type[1];
//           circle1.redStartTime = millis();
//         }
//       }
//       hasExecuted = true;
//     } else {
//       let currentTime = millis();
//       let waitTime = currentTime - lastRedDisappearTime;
      
//       if (waitTime >= 5000) { 
//         // 重置所有球为蓝色
//         for (let circle of circles) {
//           circle.color = type[0];
//           circle.Propagationvalue = 0;
//         }
        
//         // 随机选择一个球变为红色
//         let randomNumber = floor(random(1, Networkdensity + 1));
//         for (let circle1 of circles) {
//           if(circle1.no === randomNumber) {
//             circle1.color = type[1];
//             circle1.redStartTime = millis();
//           }
//         }
//         lastRedDisappearTime = null; // 重置消失时间
//         console.log("5秒已到,重置完成,新的红色球:", randomNumber);
//       }
//     }
//   }
// }
function Informationsource() {
  // 检查是否存在红色小球
  let hasRedCircle = circles.some(circle => circle.color === type[1]); // [改动1]: 检查是否有红色小球

  // 如果没有红色小球
  if (!hasRedCircle) {
    // 如果这是第一次检测到没有红色小球
    if (lastRedDisappearTime === null) { // [改动2]: 初始化红球消失时间，只记录一次
      lastRedDisappearTime = millis(); // 记录红球消失的时间
      console.log("场上没有红色球了,准备重置...");
    }

    // 检查是否所有蓝色小球已重置完成
    let allBlue = circles.every(circle => circle.color === type[0]); // [改动3]: 判断是否所有小球都变为蓝色

    // 如果所有小球已重置为蓝色
    if (allBlue) { // [改动4]: 如果所有小球为蓝色，则重新生成一个红色小球
      console.log("所有小球已重置为蓝色，随机选择一个变为红色...");
      let randomNumber = floor(random(1, Networkdensity + 1)); // 随机选择一个小球编号
      for (let circle1 of circles) {
        if (circle1.no === randomNumber) { // [改动5]: 将随机编号的小球变为红色
          circle1.color = type[1]; // 将其变为红色
          circle1.redStartTime = millis(); // 记录变红时间
        }
      }
      lastRedDisappearTime = null; // [改动6]: 重置红球消失时间，避免重复初始化
      hasExecuted = true; // [改动7]: 标记初始化完成
    }
  }
}



function redtogray() {
  let currentTime = millis();
  
  for (let circle of circles) {
    if (circle.color === type[1] && circle.redStartTime) {
      let elapsedTime = currentTime - circle.redStartTime;  // 计算变红后经过的时间
      
      if (elapsedTime >= Decayprobability)         //衰退概率  
        circle.color = type[2];  
         
      }
    }
  }


