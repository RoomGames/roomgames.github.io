console.log("Hello, Village and Kingdom!");

//PI:
const PI = 3.14159;

//gsap library:
console.log(gsap);

// canvas & context:
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

// Battle UI Elements:
let healthbar1 = document.getElementById("healthbar1");
let healthbar2 = document.getElementById("healthbar2");
let healthbar1_text = document.getElementById("healthbar1_text");
let healthbar2_text = document.getElementById("healthbar2_text");
let ability = document.getElementById("ability");
let battle_dialog = document.querySelector("#battle_dialog");
battle_dialog.addEventListener("click", () => {
    if (queue.length > 0)
    {
        queue[0]();
        queue.shift();
    }
    else
    {
        battle_dialog.style.display = "none";
    }
});

// keyState:
let keyState = {};

// renderer list:
let renderedSprites = [];

// abilities queue:
let queue = [];

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

function get_real_ability_name(ability_name)
{
    switch(ability_name)
    {
        case "蛮王冲撞":
            return "manwangchongzhuang";
        case "王者之拉":
            return "wangzhezhila";
        case "大火球":
            return "dahuoqiu";
        case "火焰护体":
            return "huoyanhuti";
        case "强袭":
            return "qiangxi";
        default:
            return "none";
    }
}

// button click event:
document.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
        //console.log(button.innerText);
        let selectedAbility = abilities[get_real_ability_name(button.innerText)];
        //attack!
        emby.attack(draggle, {
            name: button.innerText,
            damage: selectedAbility.damage,
            type: selectedAbility.damage_type
        });
        //monster's next attack:
        queue.push(() => {
            draggle.attack(emby, {
                name: abilities.qiangxi.name,
                damage: abilities.qiangxi.damage,
                type: abilities.qiangxi.damage_type
            });
        });
    });
});

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

function update_healthbar(recipient)
{
    if (recipient.battle_name === "emby")
    {
        //change healthbar text:
        healthbar1_text.innerText = recipient.battle_cur_health + "/" + recipient.battle_max_health;
        //change healthbar:
        gsap.to("#healthbar1_fill", {
            width: recipient.battle_cur_health / recipient.battle_max_health * 100 + "%"
        });
    }
    else if (recipient.battle_name === "draggle")
    {
        //change healthbar text:
        healthbar2_text.innerText = recipient.battle_cur_health + "/" + recipient.battle_max_health;
        //change healthbar:
        gsap.to("#healthbar2_fill", {
            width: recipient.battle_cur_health / recipient.battle_max_health * 100 + "%"
        });
    }
    else
    {
        console.log("Panic!!!");
    }
}

class Sprite
{
    constructor(image, x, y, frames_max = 1, sprites = {}, animate = false, frames_hold = 20, opacity = 1, rotation = 0)
    {
        this.image = image;
        this.x = x;
        this.y = y;
        this.frames_max = frames_max;
        this.sprites = sprites;
        this.animate = animate;
        this.frames_hold = frames_hold;
        this.opacity = opacity;
        this.rotation = rotation;

        this.frames_index = 0;
        this.frames_timer = 0;

        //set battle properties:
        this.battle_name = "none";
        this.battle_alive = true;
        this.battle_max_health = 100;
        this.battle_cur_health = this.battle_max_health;
        this.battle_damage = 10;

        this.image.onload = ()=>
        {
            this.width = this.image.width / this.frames_max;
            this.height = this.image.height;
        };
    }

    set_battle_info(battle_name, battle_max_health, battle_damage)
    {
        //set battle properties:
        this.battle_name = battle_name;
        this.battle_alive = true;
        this.battle_max_health = battle_max_health;
        this.battle_cur_health = this.battle_max_health;
        this.battle_damage = battle_damage;
    }

    draw()
    {
        context.save();
        if (this.rotation != 0)
        {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.rotation * PI / 180);
            context.translate(-this.x - this.width / 2, -this.y - this.height / 2);
        }
        context.globalAlpha = this.opacity;
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
        context.restore();

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

    behit(damage)
    {
        if (!this.battle_alive) return;
        this.battle_cur_health -= damage;
        if (this.battle_cur_health <= 0)
        {
            this.battle_cur_health = 0;
            this.battle_alive = false;
        }
    }

    attack(recipient, attackInfo)
    {
        let duration = 0.12;

        let attack_val = 30;
        let behit_val = 10;
        let rotationAngle = 45;

        if (recipient.battle_name === "emby")
        {
            attack_val = -attack_val;
            behit_val = -behit_val;
            rotationAngle = 225;
        }
        if (recipient.battle_name === "draggle")
        {
        }

        //set battle dialog:
        battle_dialog.style.display = "block";
        battle_dialog.innerText = this.battle_name + " 使用了 " + attackInfo.name;

        //animation
        switch(get_real_ability_name(attackInfo.name))
        {
            case "manwangchongzhuang": //蛮王冲撞
                let timeline = gsap.timeline();
                //冲撞动画:
                timeline.
                    to(this, { x:this.x - attack_val }).
                    to(this, { x:this.x + attack_val * 2, duration: duration, onComplete() {
                        //enemy gets hit:
                        recipient.behit(attackInfo.damage);
                        //update healthbar:
                        update_healthbar(recipient);
                        //shake & flash:
                        if (true)
                        {
                            gsap.to(recipient, {
                                x: recipient.x + behit_val,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.08
                            });
                            gsap.to(recipient, {
                                opacity: 0,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.05
                            });
                        }
                        else
                        {
                            let timeline2 = gsap.timeline();
                            timeline2.
                                to(recipient, { x:recipient.x + 40, duration: duration}).
                                to(recipient, { x:recipient.x, duration: duration * 5});
                        }
                    }}).
                    to(this, { x: this.x });
                break;
            case "wangzhezhila": //王者之拉
                //la animation:
                //TODO
                break;
            case "dahuoqiu": //大火球
                let fireballImage = new Image();
                fireballImage.src = "./resources/fireball.png";
                let fireball = new Sprite(fireballImage, this.x, this.y, 4, {}, true, 20, 1, rotationAngle);
                renderedSprites.push(fireball);
                //wait animation:
                gsap.to(fireball, {
                    duration: 0.5,
                    onComplete()
                    {
                        //fireball animation:
                        gsap.to(fireball, {
                            x: recipient.x,
                            y: recipient.y,
                            duration: 0.25,
                            onComplete()
                            {
                                renderedSprites.pop();
                                //enemy gets hit:
                                recipient.behit(attackInfo.damage);
                                //update healthbar:
                                update_healthbar(recipient);
                                //shake & flash:
                                gsap.to(recipient, {
                                    x: recipient.x + behit_val,
                                    yoyo: true,
                                    repeat: 5,
                                    duration: 0.08
                                });
                                gsap.to(recipient, {
                                    opacity: 0,
                                    yoyo: true,
                                    repeat: 5,
                                    duration: 0.05
                                });
                            }
                        });
                    }
                });
                break;
            case "qiangxi": //强袭
                //冲撞动画:
                gsap.timeline().
                    to(this, { x:this.x - attack_val }).
                    to(this, { x:this.x + attack_val * 2, duration: duration, onComplete() {
                        //enemy gets hit:
                        recipient.behit(attackInfo.damage);
                        //update healthbar:
                        update_healthbar(recipient);
                        //shake & flash:
                        if (true)
                        {
                            gsap.to(recipient, {
                                x: recipient.x + behit_val,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.08
                            });
                            gsap.to(recipient, {
                                opacity: 0,
                                yoyo: true,
                                repeat: 5,
                                duration: 0.05
                            });
                        }
                        else
                        {
                            gsap.timeline().
                                to(recipient, { x:recipient.x + 40, duration: duration}).
                                to(recipient, { x:recipient.x, duration: duration * 5});
                        }
                    }}).
                    to(this, { x: this.x });
                break;
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

let emby = new Sprite(embyImage, 290, 320, 4, [], true, 40);
emby.battle_name = "emby";
let draggle = new Sprite(draggleImage, 800, 100, 4, [], true, 40);
draggle.battle_name = "draggle";

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
    renderedSprites.forEach(sprite => {
        sprite.draw();
    });
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

set_battle_ui(true);
//animate();
animate_battle();