console.log("Hello, Village and Kingdom!");

let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

context.fillStyle = "white"
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

class Sprite
{
    constructor(position)
    {
        this.position = position;
    }
}

function animate()
{
    window.requestAnimationFrame(animate);
    context.drawImage(mapImage, backgroundImagePosX, backgroundImagePosY);
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
}

animate();

let keyState = {};

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