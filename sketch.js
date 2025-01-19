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

function setup() {
  createCanvas(windowWidth, windowHeight);
  generatecircles();
}

function draw() {
  background(240);
  drawcircle();


  
}

function generatecircles(){
  let Propagationprobability;//传播概率
  let Decayprobability;//衰退概率
  let propagationrange;//传播范围
  let Diffusionrate;//扩散快慢
  let Networkdensity;//网络密度
  let color;

  let no = Networkdensity;



  for(let i = 0; i < 20; i++) {
    let circledata = {
      no:i+1,
      positonx:random(50,windowWidth-50),
      positony:random(50,windowHeight-50),
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

function drawcircle()
{
    for(let circle of circles)
    {
      fill(circle.color);
      ellipse(circle.positonx,circle.positony,circle.radius);
      
      fill(0);
      textAlign(CENTER, CENTER);
      text(circle.no, circle.positonx, circle.positony);


    }


}