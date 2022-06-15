let content = document.querySelector('#content');
    let box = ``
    for (let i = 1; i < 15; i++) {
      box += `
      <div class="box">
        <div id="">No.${i}</div>
        <div id="canvas-container">
          <canvas></canvas>
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