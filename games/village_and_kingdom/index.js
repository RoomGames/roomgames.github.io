console.log("Hello, Village and Kingdom!");

//gsap library:
console.log(gsap);

// canvas & context:
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

// Battle UI Elements:
let healthbar1 = document.getElementById("healthbar1");
let healthbar2 = document.getElementById("healthbar2");
let ability = document.getElementById("ability");

// keyState:
let keyState = {};

document.addEventListener('keydown', function(event)
{
    keyState[event.key] = true;
    //console.log('按下键码：' + event.key);
});

document.addEventListener('keyup', function(event)
{
    keyState[event.key] = false;
    //console.log('释放键码：' + event.key);
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

// 1D array => 2D array
let battle_zone_map = [];
for (let i = 0; i < battle_zone.length; i+= mapWidth)
{
    battle_zone_map.push(battle_zone.slice(i, i + mapWidth));
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
        context.fillStyle = "rgba(255, 0, 0, 0.2)";
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

let battleZones = [];
battle_zone_map.forEach(
    (row, i) => 
    {
        row.forEach(
            (item, j) => 
            {
                if (item === collisionSymbol)
                    battleZones.push(
                        new Boundary(
                            j * Boundary.width + offsetX, 
                            i * Boundary.height + offsetY)
                    );
            }
        );
    }
);

//console.log(boundaries);
//console.log(battleZones);

canvas.width = 1024;
canvas.height = 576;

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

//console.log(canvas);
//console.log(context);

let mapImage = new Image();
mapImage.src = "./resources/map.png";

let foregroundImage = new Image();
foregroundImage.src = "./resources/foreground.png";

let playerImage1 = new Image();
playerImage1.src = "./resources/playerDown.png";

let playerImage2 = new Image();
playerImage2.src = "./resources/playerLeft.png";

let playerImage3 = new Image();
playerImage3.src = "./resources/playerRight.png";

let playerImage4 = new Image();
playerImage4.src = "./resources/playerUp.png";

let battleBackgroundImage = new Image();
battleBackgroundImage.src = "./resources/battleBackground.png";

let draggleImage = new Image();
draggleImage.src = "./resources/draggleSprite.png";

let embyImage = new Image();
embyImage.src = "./resources/embySprite.png";

class Sprite
{
    constructor(image, x, y, frames_max = 1, sprites = {}, animate = false, frames_hold = 20)
    {
        this.image = image;
        this.x = x;
        this.y = y;
        this.frames_max = frames_max;
        this.sprites = sprites;

        this.frames_index = 0;
        this.frames_timer = 0;
        this.animate = animate;
        this.frames_hold = frames_hold;

        this.image.onload = ()=>
        {
            this.width = this.image.width / this.frames_max;
            this.height = this.image.height;
        };
    }

    draw()
    {
        //context.drawImage(this.image, this.x, this.y);
        context.drawImage(
            this.image,
            this.frames_index * this.width,
            0,
            this.image.width / this.frames_max,
            this.image.height,
            this.x,
            this.y,
            this.image.width / this.frames_max,
            this.image.height
        );
        if (this.animate)
        {
            if (this.frames_timer % this.frames_hold === 0)
            {
                if (this.frames_index < this.frames_max - 1)
                    this.frames_index++;
                else
                    this.frames_index = 0;
            }
            if (this.frames_max > 1)
                this.frames_timer++;
        }
    }
}

let map = new Sprite(mapImage, backgroundImagePosX, backgroundImagePosY);

let foreground = new Sprite(foregroundImage, backgroundImagePosX, backgroundImagePosY);

let player = new Sprite(
    playerImage1, 
    canvas.width / 2 - playerImage1.width / 8,
    canvas.height / 2 - playerImage1.height / 2,
    4,
    [playerImage1, playerImage2, playerImage3, playerImage4],
    false,
    20
);

let battleBackground = new Sprite(battleBackgroundImage, 0, 0);

let draggle = new Sprite(draggleImage, 800, 100, 4, [], true, 40);

let emby = new Sprite(embyImage, 290, 320, 4, [], true, 40);

let movables = [map, foreground, ...boundaries, ...battleZones];

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

let battle_started = false;
const battle_start_animation_duration = 0.6;

function set_battle_ui(visible)
{
    if (visible)
    {
        healthbar1.style.visibility = "visible";
        healthbar2.style.visibility = "visible";
        ability.style.visibility = "visible";
    }
    else
    {
        healthbar1.style.visibility = "hidden";
        healthbar2.style.visibility = "hidden";
        ability.style.visibility = "hidden";
    }
}

function start_battle()
{
    battle_started = true;
    //deactivate current animation loop:
    window.cancelAnimationFrame(animationId);
    //use gsap lib:
    gsap.to("#cover", {
        opacity: 1,
        repeat: 1,
        yoyo: true,
        duration: battle_start_animation_duration,
        onComplete()
        {
            gsap.to("#cover", {
                opacity: 1,
                duration: battle_start_animation_duration,
                onComplete()
                {
                    //enable battle ui:
                    set_battle_ui(true);
                    //activate new animation loop:
                    animate_battle();
                    //hide cover:
                    gsap.to("#cover", {
                        opacity: 0,
                        duration: battle_start_animation_duration
                    });
                }
            });
        }
    });
}

function input()
{
    if 
    (
        checkKeyState("w") || checkKeyState("ArrowUp") ||
        checkKeyState("s") || checkKeyState("ArrowDown") ||
        checkKeyState("a") || checkKeyState("ArrowLeft") ||
        checkKeyState("d") || checkKeyState("ArrowRight")
    )
    {
        for (let i = 0; i < battleZones.length; i++)
        {
            let battleZone = battleZones[i];
            let overlappingArea = 
                (Math.min(player.x + player.width, battleZone.x + Boundary.width) - 
                Math.max(player.x, battleZone.x)) * 
                (Math.min(player.y + player.height, battleZone.y + Boundary.height) -
                Math.max(player.y, battleZone.y));
            if (AABB_Collision(player.x, player.y, player.width, player.height,
                battleZone.x, battleZone.y, Boundary.width, Boundary.height) &&
                overlappingArea > player.width * player.height / 2)
            {
                if (Math.random() < 0.01)
                {
                    start_battle();
                    console.log("battle zone collision!");
                }
                break;
            }
        }
    }
    let move = true;
    if (checkKeyState("w") || checkKeyState("ArrowUp"))
    {
        player.animate = true;
        player.image = player.sprites[3];
        for (let i = 0; i < boundaries.length; i++)
        {
            let boundary = boundaries[i];
            if (AABB_Collision(player.x, player.y, player.width, player.height,
                boundary.x, boundary.y + playerMoveSpeed, Boundary.width, Boundary.height))
            {
                // Collision detected!
                console.log("collision!");
                move = false;
                break;
            }
        }
        if (move)
        {
            movables.forEach(movable => {
                movable.y += playerMoveSpeed;
            });
        }
    }
    else if (checkKeyState("s") || checkKeyState("ArrowDown"))
    {
        player.animate = true;
        player.image = player.sprites[0];
        for (let i = 0; i < boundaries.length; i++)
        {
            let boundary = boundaries[i];
            if (AABB_Collision(player.x, player.y, player.width, player.height,
                boundary.x, boundary.y - playerMoveSpeed, Boundary.width, Boundary.height))
            {
                // Collision detected!
                console.log("collision!");
                move = false;
                break;
            }
        }
        if (move)
        {
            movables.forEach(movable => {
                movable.y -= playerMoveSpeed;
            });
        }
    }
    else if (checkKeyState("a") || checkKeyState("ArrowLeft"))
    {
        player.animate = true;
        player.image = player.sprites[1];
        for (let i = 0; i < boundaries.length; i++)
        {
            let boundary = boundaries[i];
            if (AABB_Collision(player.x, player.y, player.width, player.height,
                boundary.x + playerMoveSpeed, boundary.y, Boundary.width, Boundary.height))
            {
                // Collision detected!
                console.log("collision!");
                move = false;
                break;
            }
        }
        if (move)
        {
            movables.forEach(movable => {
                movable.x += playerMoveSpeed;
            });
        }
    }
    else if (checkKeyState("d") || checkKeyState("ArrowRight"))
    {
        player.animate = true;
        player.image = player.sprites[2];
        for (let i = 0; i < boundaries.length; i++)
        {
            let boundary = boundaries[i];
            if (AABB_Collision(player.x, player.y, player.width, player.height,
                boundary.x - playerMoveSpeed, boundary.y, Boundary.width, Boundary.height))
            {
                // Collision detected!
                console.log("collision!");
                move = false;
                break;
            }
        }
        if (move)
        {
            movables.forEach(movable => {
                movable.x -= playerMoveSpeed;
            });
        }
    }
}

function render()
{
    map.draw();
    boundaries.forEach(
        boundary => {
            boundary.draw();
        }
    );
    battleZones.forEach(
        battleZone =>{
            battleZone.draw();
        }
    );
    player.draw();
    foreground.draw();
}

let animationId;

function animate_battle()
{
    window.requestAnimationFrame(animate_battle);
    battleBackground.draw();
    draggle.draw();
    emby.draw();
}

function animate()
{
    animationId = window.requestAnimationFrame(animate);

    player.animate = false;

    if (!battle_started)
    {
        input();
    }
    
    if (!player.animate)
    {
        player.frames_index = 0;
        player.frames_timer = 0;
    }

    render();
}

set_battle_ui(false);
animate();
//animate_battle();