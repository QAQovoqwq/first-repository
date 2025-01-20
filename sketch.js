/*
我要创建一个画布
上面分布这小点代表个体
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

let circles = [];
let type = ['blue','red','gray'] ;
let Diffusionrate = 1;      //扩散快慢
let Propagationvalue = 0;   //传播值
let thresholdvalue = 2;     //传播阈值
let Informationnum = 1;     //信息源
let Networkdensity = 20;    //网络密度
let timeThreshold = 3000;   //时间阈值ms
let staretime = 0;           // 程序开始时间
let Decayprobability = 5000;         //衰退概率

let graymaxradius = 100;
let expansionSpeed = 2;
let currentradius = 0;

let hasExecuted = false; 
let lastRedDisappearTime = null; //最后一个红球消失的时间

function setup() {
  createCanvas(windowWidth, windowHeight);
  generatecircles();
  staretime = millis();
}

function draw() {
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
  console.log(circles[staretime]);
  
}


function generatecircles(){
  let Propagationprobability;   //传播概率
  let propagationrange = graymaxradius;         //传播范围
  
  let no = Networkdensity;

  for(let i = 0; i < Networkdensity; i++) {
    let circledata = {
      no:i+1,
      positonX:random(50,windowWidth-50),
      positonY:random(50,windowHeight-50),
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
      currentRadius: 0,  // 为每个圆圈添加自己的currentRadius属性
      redStartTime: null  // 添加新变量记录变红的时间点
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

    if(circle.positonX - circle.radius < 0 || circle.positonX + circle.radius>windowWidth)
    {
      circle.dx *= -1;
    }
    
    if (circle.positonY - circle.radius < 0 || circle.positonY + circle.radius > windowHeight) 
    {
      circle.dy *= -1; 
    }
  }

}


function drawcircle()
{
  for(let circle of circles)
  {
    fill(circle.color);
    ellipse(circle.positonX,circle.positonY,circle.radius);
    
    fill(0);
    textAlign(CENTER, CENTER);
    text(circle.no, circle.positonX, circle.positonY);

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
            circle1.color = type[1];           // 变为红色
            circle1.redStartTime = millis();   // 记录变红的时间点
          }
        }
      }
    }
  }


function Informationsource() { 
  let hasRedCircle = circles.some(circle => circle.color === type[1]);
  
  if (!hasRedCircle) {
    if (lastRedDisappearTime === null) {
      lastRedDisappearTime = millis(); // 记录红球消失的时间点
      console.log("场上没有红色球了！等待5秒后重置...");
    }
    
    if (!hasExecuted) { // 只执行一次初始随机红色球的生成
      let randomNumber = floor(random(1, Networkdensity + 1));
      for (let circle1 of circles) {
        if(circle1.no === randomNumber) {
          circle1.color = type[1];
          circle1.redStartTime = millis();
        }
      }
      hasExecuted = true;
    } else {
      let currentTime = millis();
      let waitTime = currentTime - lastRedDisappearTime;
      
      if (waitTime >= 5000) { 
        // 重置所有球为蓝色
        for (let circle of circles) {
          circle.color = type[0];
          circle.Propagationvalue = 0;
        }
        
        // 随机选择一个球变为红色
        let randomNumber = floor(random(1, Networkdensity + 1));
        for (let circle1 of circles) {
          if(circle1.no === randomNumber) {
            circle1.color = type[1];
            circle1.redStartTime = millis();
          }
        }
        lastRedDisappearTime = null; // 重置消失时间
        console.log("5秒已到,重置完成,新的红色球:", randomNumber);
      }
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


