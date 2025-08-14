"use strict";

var ctx, background, player, score, gameover, toLeft, toRight, left, right, shift, speed = 1.5, newcube = 5;
var cubes = [];

function startGame() {
    gameArea.start();
    player = new component(8, 8, (gameArea.canvas.width / 2) - 4, -20, "white");
    score = new component("10px", "Press Start 2P",
        0, 20, "white", "text");
    score.text = "SCORE: ";
    background = new component(gameArea.canvas.width, gameArea.canvas.height,
        0, 0, 'hsla(' + shift + ', 100%, 50%, 0.2)');
    cubes.push(new component(10, 10, (gameArea.canvas.width / 2) - 5, 0, "black"));
}

var gameArea = {
    canvas: document.getElementById("jump"),
    start: function () {
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        if (localStorage.getItem("HS2") !== null) {
            this.highscore = localStorage.getItem("HS2")
        }
        else { this.highscore = "0"; }
        document.getElementById("HS2").innerHTML = this.highscore;
        window.addEventListener('keydown', function (e) {
            if (e.key == 'ArrowLeft') { toLeft = true; toRight = false; left = true; }
            if (e.key == 'ArrowRight') { toRight = true; toLeft = false; right = true; }
            if (e.key == ' ' && gameover) { location.reload(); }
        });
        window.addEventListener('keyup', function (e) {
            if (e.key == 'ArrowLeft') {
                toLeft = false;
                left = false;
                if (right) { toRight = true; }
            }
            if (e.key == 'ArrowRight') {
                toRight = false;
                right = false;
                if (left) { toLeft = true; }
            }
        });
        window.addEventListener('touchstart', function (e) {
            e.preventDefault();
            gameArea.x = e.touches[0].screenX;
            if (gameArea.x) {
                if (gameArea.x < screen.width / 2) { toLeft = true; toRight = false; }
                if (gameArea.x > screen.width / 2) { toRight = true; toLeft = false; }
            }
        });
        window.addEventListener('touchend', function (e) {
            e.preventDefault();
            if (gameover) { location.reload(); }
            if (gameArea.x < screen.width / 2) { toLeft = false; }
            if (gameArea.x > screen.width / 2) { toRight = false; }
        });
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
    }
}

function component(width, height, x, y, color, type) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.gravity = 0.25;
    this.speed = 0;
    this.color = color;
    this.type = type;
    this.update = function () {
        ctx = gameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            this.x = gameArea.canvas.width / 2 - (ctx.measureText(this.text)).width / 2;
            ctx.fillText(this.text, this.x, this.y);
        }
        else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },
    this.jumpOn = function (cube) {
        let playerleft = this.x;
        let playerright = this.x + (this.width);
        let playertop = this.y;
        let playerbottom = this.y + (this.height);
        let cubeleft = cube.x;
        let cuberight = cube.x + (cube.width);
        let cubetop = cube.y;
        let jump = true;
        if ((playerleft > cuberight) || (playerright < cubeleft) ||
            (playertop > cubetop) || (playerbottom < cubetop)) {
            jump = false;
        }
        return jump;
    }      
}

function updateGameArea() {
    let x, y;
    if (player.y > gameArea.canvas.height) {
        if (gameArea.frameNo > Number(gameArea.highscore)) {
            localStorage.setItem("HS2", String(gameArea.frameNo));
            document.getElementById("HS2").innerHTML = localStorage.getItem("HS2");
        }
        gameover = true;
        gameArea.stop();
        return;
    }
    gameArea.clear();
    gameArea.frameNo += 1;

    if (gameArea.frameNo == 1) {
        shift = Math.floor(Math.random() * (361));
    }
    if (everyinterval(50)) {
        if (speed < 2.5) { speed += 0.01; }
        if (newcube < 10) { newcube += 0.1; }
        else if (newcube < 15) { newcube += 0.01; }
        if (shift > 360) { shift = 0; }
        shift += 2;
    }
    if (gameArea.frameNo == 1 || (cubes[cubes.length - 1].y > newcube)) {
        x = Math.floor(Math.random() * (gameArea.canvas.width - 9));
        y = -10;
        let color = 'hsl(' + shift + ', 100%, 50%)';
        cubes.push(new component(10, 10, x, y, color));
    }
    for (let i = 0; i < cubes.length; i += 1) {
        cubes[i].y += speed;
        if (cubes[0].y > gameArea.canvas.height + 10) {
            cubes.shift();
        }
        cubes[i].update();
        if (player.jumpOn(cubes[i]) && player.speed > 0) {
            player.speed = -6;
        }
    }
    if (toLeft) { player.x -= 3.5; }
    if (player.x + 8 < 0) { player.x = gameArea.canvas.width; }
    if (toRight) { player.x += 3.5; }
    if (player.x > gameArea.canvas.width) { player.x = -8; }
    if (player.speed < 6) { player.speed += player.gravity; }
    player.y += player.speed;

    background.color = 'hsla(' + shift + ', 100%, 50%, 0.2)';
    score.text = "SCORE: " + gameArea.frameNo;
    background.update();
    score.update();
    player.update();
}

function everyinterval(n) {
    if ((gameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}