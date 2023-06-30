console.log("Hello, Village and Kingdom!");

// canvas & context:
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

// keyState:
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

//test map.js
//console.log(map_collision);

let mapWidth = 70;
let mapHeight = 40;
const collisionSymbol = 1025;

const offsetX = -800;
const offsetY = -400;

let backgroundImagePosX = offsetX;
let backgroundImagePosY = offsetY;
let playerMoveSpeed = 3;

// 1D array => 2D array
let collisionMap = [];
for (let i = 0; i < map_collision.length; i+= mapWidth)
{
    collisionMap.push(map_collision.slice(i, i + mapWidth));
}

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
collisionMap.forEach(
    (row, i) => 
    {
        row.forEach(
            (item, j) => 
            {
                if (item === collisionSymbol)
                    boundaries.push(
                        new Boundary(
                            j * Boundary.width + offsetX, 
                            i * Boundary.height + offsetY)
                    );
            }
        );
    }
);

//console.log(boundaries);

canvas.width = 1024;
canvas.height = 576;

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

//console.log(canvas);
//console.log(context);

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

class Sprite
{
    constructor(image, x, y, frames_max = 1)
    {
        this.image = image;
        this.x = x;
        this.y = y;
        this.frames_max = frames_max;
        this.image.onload = ()=>
        {
            this.width = this.image.width / this.frames_max;
            this.height = this.image.height;
            console.log(this.width);
            console.log(this.height);
        };
    }

    draw()
    {
        //context.drawImage(this.image, this.x, this.y);
        context.drawImage(this.image,
            0,
            0,
            this.image.width / this.frames_max,
            this.image.height,
            this.x,
            this.y,
            this.image.width / this.frames_max,
            this.image.height
        );
    }
}

let map = new Sprite(mapImage, backgroundImagePosX, backgroundImagePosY);

let player = new Sprite(playerImage1, 
    canvas.width / 2 - playerImage1.width / 8,
    canvas.height / 2 - playerImage1.height / 2,
    4);

let testBoundary = new Boundary(400, 300);

let movables = [map, testBoundary];

//from: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function AABB_Collision(rect1_x, rect1_y, rect1_w, rect1_h, 
    rect2_x, rect2_y, rect2_w, rect2_h)
{
    if (
        rect1_x < rect2_x + rect2_w &&
        rect1_y < rect2_y + rect2_h &&
        rect1_x + rect1_w > rect2_x &&
        rect1_y + rect1_h > rect2_y
    )
    {
        // Collision detected!
        return true;
    }
    else
    {
        // No collision
        return false;
    }
}

function animate()
{
    if (AABB_Collision(player.x, player.y, player.width, player.height,
        testBoundary.x, testBoundary.y, Boundary.width, Boundary.height))
    {
        // Collision detected!
        console.log("collision!");
    }
    if (checkKeyState("w") || checkKeyState("ArrowUp"))
    {
        movables.forEach(movable => {
            movable.y += playerMoveSpeed;
        });
    }
    else if (checkKeyState("s") || checkKeyState("ArrowDown"))
    {
        movables.forEach(movable => {
            movable.y -= playerMoveSpeed;
        });
    }
    else if (checkKeyState("a") || checkKeyState("ArrowLeft"))
    {
        movables.forEach(movable => {
            movable.x += playerMoveSpeed;
        });
    }
    else if (checkKeyState("d") || checkKeyState("ArrowRight"))
    {
        movables.forEach(movable => {
            movable.x -= playerMoveSpeed;
        });
    }
    map.draw();
    testBoundary.draw();
    // boundaries.forEach(
    //     boundary => {
    //         boundary.draw();
    //     }
    // );
    player.draw();
    // context.drawImage(playerImage1, 
    //     0,
    //     0,
    //     playerImage1.width / 4,
    //     playerImage1.height,
    //     canvas.width / 2 - playerImage1.width / 8, 
    //     canvas.height / 2 - playerImage1.height / 2,
    //     playerImage1.width / 4,
    //     playerImage1.height
    // );
    window.requestAnimationFrame(animate);
}

animate();