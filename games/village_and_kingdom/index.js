console.log("Hello, Village and Kingdom!");

let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");
let keyState = {};

//test map.js
console.log(map_collision);

class Boundary
{
    static width = 48;  //12 * 4(zoom)
    static height = 48; //12 * 4(zoom)

    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    draw()
    {
        context.fillStyle = "red";
        context.fillRect(this.x, this.y, Boundary.width, Boundary.height);
    }
}

let boundaries = [];



canvas.width = 1024;
canvas.height = 576;

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

console.log(canvas);
console.log(context);

let mapImage = new Image();
mapImage.src = "./resources/map.png";

let playerImage1 = new Image();
playerImage1.src = "./resources/playerDown.png";

let playerImage2 = new Image();
playerImage2.src = "./resources/playerLeft.png";

let playerImage3 = new Image();
playerImage3.src = "./resources/playerRight.png";

let playerImage4 = new Image();
playerImage4.src = "./resources/playerUp.png";

let backgroundImagePosX = -800;
let backgroundImagePosY = -400;
let playerMoveSpeed = 3;

class Sprite
{
    constructor(image, x, y)
    {
        this.image = image;
        this.x = x;
        this.y = y;
    }

    draw()
    {
        context.drawImage(this.image, this.x, this.y);
    }
}

let map = new Sprite(mapImage, backgroundImagePosX, backgroundImagePosY);

document.addEventListener('keydown', function(event)
{
    keyState[event.key] = true;
    console.log('按下键码：' + event.key);
});

document.addEventListener('keyup', function(event)
{
    keyState[event.key] = false;
    console.log('释放键码：' + event.key);
});

function checkKeyState(key)
{
    return keyState[key] === true;
}

function animate()
{
    if (checkKeyState("w") || checkKeyState("ArrowUp"))
    {
        map.y += playerMoveSpeed;
    }
    else if (checkKeyState("s") || checkKeyState("ArrowDown"))
    {
        map.y -= playerMoveSpeed;
    }
    else if (checkKeyState("a") || checkKeyState("ArrowLeft"))
    {
        map.x += playerMoveSpeed;
    }
    else if (checkKeyState("d") || checkKeyState("ArrowRight"))
    {
        map.x -= playerMoveSpeed;
    }
    map.draw();
    context.drawImage(playerImage1, 
        0,
        0,
        playerImage1.width / 4,
        playerImage1.height,
        canvas.width / 2 - playerImage1.width / 8, 
        canvas.height / 2 - playerImage1.height / 2,
        playerImage1.width / 4,
        playerImage1.height
    );
    window.requestAnimationFrame(animate);
}

animate();