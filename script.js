
//carga primero las imagenes del background
//porque dependiendo del pc puede tardar mas o menos en cargar
const imagenFondo1 = new Image();
imagenFondo1.src = "imagenes/fondo-1.png";
const imagenFondo2 = new Image();
imagenFondo2.src = "imagenes/fondo-2.png";
const imagenFondo3 = new Image();
imagenFondo3.src = "imagenes/fondo-3.png";

const nubeChica = new Image();
nubeChica.src = "imagenes/nubes-chicas.png";
const nubeMediana = new Image();
nubeMediana.src = "imagenes/nubes-medianas.png";
const nubeGrande = new Image();
nubeGrande.src = "imagenes/nubes-grandes.png";


window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");


  canvas.width = 1100;
  canvas.height = 600;
  let enemies = [];
  let score = 0;
  let gameOver = false;
  let vidas = 2;
  let golpeado = false;
  let frame = 0;
  let gano = false;

  const puntajeMaximo = 2;

  class InputHandler {
    constructor() {
      this.keys = [];
      //registrar salto con la tecla ↑
      window.addEventListener("keydown", (e) => {
        if (e.key == "ArrowUp" && this.keys.indexOf(e.key) == -1) {
          this.keys.push(e.key);
        }
      });
      window.addEventListener("keyup", (e) => {
        if (e.key == "ArrowUp") {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
      });

      //registrar salto touch screen
      window.addEventListener("touchstart", (e) => {
        if (e.target.id == "canvas") this.keys.push("ArrowUp");
      });
      window.addEventListener("touchend", (e) => {
        this.keys.splice(this.keys.indexOf("ArrowUp"), 1);
      });

      //registrar salto con click
      window.addEventListener("mousedown", (e) => {
        if (e.target.id == "canvas") this.keys.push("ArrowUp");
      });
      window.addEventListener("mouseup", (e) => {
        this.keys.splice(this.keys.indexOf("ArrowUp"), 1);
      });
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 64;
      this.height = 86;
      this.x = 100;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("imagenPlayer");
      this.frameX = 0;
      this.frameY = 0;
      this.vy = 0;
      this.weight = 1;
      this.fps = 30;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.height * this.frameY,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    update(input, deltaTime, enemies) {
      //colicion
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - (this.x + this.width / 2);
        const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2);
        const distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia < enemy.width / 2 + this.width / 2) {
          console.log(vidas);
          vidas--;
          golpeado = true;
        }
      });

      //para prevenir multiples choques con el mismo enemigo
      if (golpeado) {
        enemies.shift();
        golpeado = false;
      }

      if (gano == true) {
        this.frameX = 6;
        gameOver = true;
      }

      if (vidas == 0) {
        this.frameX = 5;
        gameOver = true;
      }

      //animacion salto
      if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
        this.vy -= 30;
        this.frameX = 4;
      }
      this.y += this.vy;
      if (!this.onGround()) {
        this.vy += this.weight;
      }

      //animacion corriendo
      else {
        if (this.frameTimer > this.frameInterval) {
          if (this.frameX < 3) {
            this.frameX++;
          } else {
            this.frameX = 0;
          }
          this.frameTimer = 0;
        } else {
          this.frameTimer += deltaTime;
        }
        this.vy = 0;
      }
    }
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Fondo {
    constructor(imagen, speed, piso) {
      this.x = 0;
      this.y = piso;
      this.width = imagen.width;
      this.height = imagen.height;
      this.imagen = imagen;
      this.speed = speed;
    }

    draw(context) {
      context.drawImage(
        this.imagen,
        this.x,
        canvas.height - this.y - this.height,
        this.width,
        this.height
      );
      context.drawImage(
        this.imagen,
        this.x + this.width,
        canvas.height - this.y - this.height,
        this.width,
        this.height
      );
    }

    update() {
      if (this.x <= -this.width) {
        this.x = 0;
      }
      this.x = (frame * this.speed) % this.width;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 84;
      this.height = 64;
      this.image = document.getElementById("imagenEnemy");
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.fps = 10;
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.frameX = 0;
      this.speed = 6;
      this.finalized = false;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

    update(deltaTime) {
      this.x -= this.speed;
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX < 3) {
          this.frameX++;
        } else {
          this.frameX = 0;
        }
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      if (this.x < 0 - this.width) {
        this.finalized = true;
        score++;
      }
    }
  }

  //
  function handleEnemies(deltaTime) {
    if (enemyTimer > randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, 500));
      randomEnemyInterval = Math.random() * 1000 + 500;
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    enemies = enemies.filter((enemy) => !enemy.finalized);
  }

  function handleFondos(ctx) {
    fondo3.draw(ctx);
    fondo3.update();
    fondo5.draw(ctx);
    fondo5.update();
    fondo6.draw(ctx);

    fondo6.update();
    fondo4.draw(ctx);

    fondo4.update();
    fondo2.draw(ctx);

    fondo2.update();
    fondo1.draw(ctx);

    fondo1.update();
  }

  function displayText(context) {
    context.fillStyle = "white";
    context.fillText("Vidas: " + vidas, 800, 50);

    context.fillStyle = "black";

    for (let i = 0; i < puntajeMaximo; i++) {
      context.fillText("★", 30 + i * 50, 50);
    }
    ctx.font = "40px Helvetica";
    ctx.fillStyle = "yellow";

    for (let i = 0; i < score; i++) {
      ctx.fillText("★", 30 + i * 50, 50);
    }
  }

  function displayGameOver(context) {
    context.fillStyle = "white";
    context.font = "40px Helvetica";
    if (gano) {
      context.fillText("¡Ganaste!", canvas.width / 2, canvas.height / 2);
    } else {
      context.fillText(
        "Perdiste 😥 - Puntuación: " + score + "/" + puntajeMaximo,
        canvas.width / 2 / 2,
        canvas.height / 2
      );
    }
  }

  //carga input, player y fondos
  const input = new InputHandler();
  const player = new Player(canvas.width, 500);
  const fondo1 = new Fondo(imagenFondo1, 0.5, 0);
  const fondo2 = new Fondo(imagenFondo2, 2, 79);
  const fondo3 = new Fondo(imagenFondo3, 2.5, 200);
  const fondo4 = new Fondo(nubeChica, 0.3, 200);
  const fondo5 = new Fondo(nubeMediana, 0.7, 400);
  const fondo6 = new Fondo(nubeGrande, 1, 400);

  // spawn de enemigos
  let lastTime = 0;
  let enemyTimer = 0;
  let randomEnemyInterval = Math.random() * 1000+(500);

  //funcion para dibujar
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    handleFondos(ctx);
    displayText(ctx);
    player.update(input, deltaTime, enemies);
    player.draw(ctx);
    handleEnemies(deltaTime);
    frame--;
    if (vidas <= 0 || score == puntajeMaximo || gameOver == true) {
      if (vidas <= 0) gano = false;
      if (score == puntajeMaximo) gano = true;
      requestAnimationFrame(finished);
    } else {
      requestAnimationFrame(animate);
    }
  }

  function finished(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleFondos(ctx);
    displayGameOver(ctx);
    player.update(input, deltaTime, enemies);
    player.draw(ctx);
    handleEnemies(deltaTime);
    frame--;
  }

  //start
  animate(0);
});
