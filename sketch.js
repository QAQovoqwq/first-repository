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

let graymaxradius = 100;
let expansionSpeed = 2;
let currentradius = 0;



function setup() {
  createCanvas(windowWidth, windowHeight);
  generatecircles();
}

function draw() {
  background(240);
  movecircle();
  drawcircle();
  rangeinfluence();
  updateRadius();
  
  
}

function generatecircles(){
  let Propagationprobability;   //传播概率
  let Decayprobability;         //衰退概率
  let propagationrange;         //传播范围
  let Diffusionrate = 1;            //扩散快慢
  let Networkdensity = 1;           //网络密度
  let color;

  let no = Networkdensity;



  for(let i = 0; i < 20*Networkdensity; i++) {
    let circledata = {
      no:i+1,
      positonX:random(50,windowWidth-50),
      positonY:random(50,windowHeight-50),
      dx:random(-5*Diffusionrate, 5*Diffusionrate), //x方向速度
      dy:random(-5*Diffusionrate, 5*Diffusionrate), //y方向速度
      radius:50,
      Propagationprobability,
      Decayprobability,
      propagationrange,
      Diffusionrate,
      color:'yellow'
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

function rangeinfluence()
{


  for(let circle of circles)
  {
    noFill(); 
    strokeWeight(2);

    stroke(200); 
    ellipse(circle.positonX, circle.positonY, currentradius * 2);

    if (currentradius > graymaxradius * 0.6) {
      stroke(150); 
      ellipse(circle.positonX, circle.positonY, currentradius * 0.8 * 2); // 第二层圆
    }

    if (currentradius > graymaxradius * 0.3) {
      stroke(100); 
      ellipse(circle.positonX, circle.positonY, currentradius * 0.5 * 2); // 第三层圆
    
    }
  
  }
}

function updateRadius() {
  currentradius += expansionSpeed; 
  if (currentradius > graymaxradius) 
  {
    currentradius = 0; 
  }
}