let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");
// Create gradient
let grd = ctx.createRadialGradient(75,50,5,90,60,100);
grd.addColorStop(0,"red");
grd.addColorStop(1,"white");

// Fill with gradient
ctx.fillStyle = grd;
ctx.fillRect(10,10,150,80);

let content = document.querySelector('#content');
    let box = ``
    for (let i = 1; i < 15; i++) {
      box += `
      <div class="box">
        <div id="">No.${i}</div>
        <div id="canvas-container">
        <canvas id="myCanvas" width="250" height="150"></canvas>
        </div>
        <div id="info">
          <div id="status">
            <div id="star-mode"><img id="star-img" src="/media/star.png" alt="star"></div>
            <div id="total-star">0</div>
            <div id="meteorite-mode"><img id="meteorite-img" src="/media/meteorite.png" alt="meteorite"></div>
            <div id="total-meteorite">0</div>
            <div id="blackhole-mode"><img id="blackhole-img" src="/media/blackhole.png" alt="blackhole"></div>
            <div id="total-blackhole">0</div>
          </div>
          <div id="play">
            <a href="./index.html"><button>Play</button></a>
          </div>
        </div>
      </div>`
    }
    content.innerHTML += box;