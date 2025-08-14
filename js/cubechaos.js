"use strict";

var ctx, background, player, score, gameover, toLeft, toRight, left, right, shift, newcube = 100;
var cubes = [];

function startGame() {
    gameArea.start();
    player = new component(8, 8, gameArea.canvas.width / 2 - 4, gameArea.canvas.height / 2 - 4, "white");
    score = new component("10px", "Press Start 2P",
        0, 20, "white", "text");
    score.text = "SCORE: ";
    background = new component(gameArea.canvas.width, gameArea.canvas.height,
        0, 0, 'hsla(' + shift + ', 100%, 50%, 0.2)', "background")
}

var gameArea = {
    canvas: document.getElementById("chaos"),
    start: function () {
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        if (localStorage.getItem("HS4") !== null) {
            this.highscore = localStorage.getItem("HS4")
        }
        else { this.highscore = "0"; }
        document.getElementById("HS4").innerHTML = this.highscore;
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
    this.angle = 0;
    this.moveAngle = 0;
    this.speed = 1;
    this.color = color;
    this.type = type;
    this.update = function () {
        ctx = gameArea.context;
        if (this.type == "background") {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

        }
        else if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            this.x = gameArea.canvas.width / 2 - (ctx.measureText(this.text)).width / 2;
            ctx.fillText(this.text, this.x, this.y);
        }
        else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
        }
    },
    this.crashWith = function (cube) {
        let playerleft = this.x;
        let playerright = this.x + (this.width);
        let playertop = this.y;
        let playerbottom = this.y + (this.height);
        let cubeleft = cube.x;
        let cuberight = cube.x + (cube.width);
        let cubetop = cube.y;
        let cubebottom = cube.y + (cube.height);
        let crash = true;
        if ((playerleft > cuberight) || (playerright < cubeleft) ||
            (playertop > cubebottom) || (playerbottom < cubetop)) {
            crash = false;
        }
        return crash;
    },
    this.direction = function (cube) {
        let y2 = this.y;
        let y1 = cube.y;
        let x2 = this.x;
        let x1 = cube.x;
        let direction = Math.atan2(y2 - y1, x2 - x1);
        return direction;
    }
}

function updateGameArea() {
    let width = gameArea.canvas.width;
    let height = gameArea.canvas.height;
    for (let i = 0; i < cubes.length; i += 1) {
        if (player.crashWith(cubes[i])) {
            if (gameArea.frameNo > Number(gameArea.highscore)) {
                localStorage.setItem("HS4", String(gameArea.frameNo));
                document.getElementById("HS4").innerHTML = localStorage.getItem("HS4");
            }
            gameover = true;
            gameArea.stop();
            return;
        }
    }
    gameArea.clear();
    gameArea.frameNo += 1;

    if (gameArea.frameNo == 1) {
        shift = Math.floor(Math.random() * (360 + 1));
    }
    if (everyinterval(100)) {
        if (newcube > 50) { newcube -= 1; }
    }
    if (everyinterval(50)) {
        if (shift > 360) { shift = 0; }
        shift += 2;
    } 
    if (gameArea.frameNo == 1 || everyinterval(newcube)) {
        let random = Math.floor(Math.random() * 2);
        let x, y;
        if (random == 0) { x = -10; y = -10; }
        if (random == 1) { x = -10; y = height + 10; }
        if (random == 1) { x = width + 10; y = -10; }
        if (random == 0) { x = width + 10; y = height + 10; }
        let color = 'hsl(' + shift + ', 100%, 50%)';
        cubes.push(new component(10, 10, x, y, color));
    }
    for (let i = 0; i < cubes.length; i += 1) {
        for (let j = 0; j < cubes.length; j += 1) {
            if (i != j && cubes[i] != undefined && cubes[j] != undefined) {
                if (cubes[i].crashWith(cubes[j])) {
                    cubes.splice(i, 1);
                }
            }
        }
    }
    for (let i = 0; i < cubes.length; i += 1) {
        if (cubes[i] != undefined) {
            let getAngle = player.direction(cubes[i]);
            let atAngle = cubes[i].angle;
            if (atAngle < getAngle) {
                if (Math.abs(atAngle - getAngle) < Math.PI) { cubes[i].moveAngle = 1; }
                else { cubes[i].moveAngle = -1; }
            }
            else {
                if (Math.abs(atAngle - getAngle) < Math.PI) { cubes[i].moveAngle = -1; }
                else { cubes[i].moveAngle = 1; }
            }
            cubes[i].angle += cubes[i].moveAngle * Math.PI / 180;
            cubes[i].angle = cubes[i].angle % (2 * Math.PI);
            cubes[i].x += cubes[i].speed * (Math.cos(cubes[i].angle));
            cubes[i].y += cubes[i].speed * (Math.sin(cubes[i].angle));
            if (everyinterval(100)) {
                if (cubes[i].speed < 4) { cubes[i].speed += 0.1; }
            }
            cubes[i].update();
        }
        
    }
    if (toLeft) {
        player.moveAngle = -6;
    }
    if (toRight) {
        player.moveAngle = 6;
    }
    if (!toLeft && !toRight) {
        player.moveAngle = 0;
    }
    player.speed = 2;
    player.angle += player.moveAngle * Math.PI / 180;
    player.x += player.speed * Math.sin(player.angle);
    player.y -= player.speed * Math.cos(player.angle);
    if (player.x < 8) { player.x = 8; }
    if (player.x + 8 > width) { player.x = width - 8; }
    if (player.y < 8) { player.y = 8; }
    if (player.y + 8 > height) { player.y = height - 8; }

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