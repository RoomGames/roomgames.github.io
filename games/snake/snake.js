let rows = 20;
let cols = 20;
let blockSize = 25; //px
let board;
let context;

let snakePosX = 5;
let snakePosY = 5;
let snakeVelocityX = 0;
let snakeVelocityY = 0;
let snakeBody = [];

let foodPosX;
let foodPosY;

let score = 0;
let gameOver = false;

window.onload = function ()
{
    board = document.getElementById("board");
    board.width = cols * blockSize;
    board.height = rows * blockSize;
    context = board.getContext("2d");
    document.addEventListener("keydown", change_direction);
    place_food();
    setInterval(update, 100);
}

function update()
{
    if (gameOver) return;

    document.getElementById("score").innerHTML = "Score:" + score.toString();

    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "red";
    context.fillRect(foodPosX * blockSize, foodPosY * blockSize, blockSize, blockSize);

    if (snakePosX == foodPosX && snakePosY == foodPosY)
    {
        score++;
        snakeBody.push([foodPosX, foodPosY]);
        place_food();
    }

    for (let i = snakeBody.length - 1; i > 0; i--)
    {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length > 0)
    {
        snakeBody[0] = [snakePosX, snakePosY];
    }

    context.fillStyle = "lime";
    snakePosX += snakeVelocityX;
    snakePosY += snakeVelocityY;
    context.fillRect(snakePosX * blockSize, snakePosY * blockSize, blockSize, blockSize);

    for (let i = 0; i < snakeBody.length; i++)
    {
        context.fillRect(snakeBody[i][0] * blockSize, snakeBody[i][1] * blockSize, blockSize, blockSize);
    }

    if (snakePosX < 0 || snakePosX > cols - 1 || snakePosY < 0 || snakePosY > rows - 1)
    {
        gameOver = true;
        alert("Game Over!");
    }

    for (let i = 0; snakeBody.length; i++)
    {
        if (snakePosX == snakeBody[i][0] && snakePosY == snakeBody[i][1])
        {
            gameOver = true;
            alert("Game Over!");
        }
    }
}

//int:[0, max)
function range(max)
{
    return Math.floor(Math.random() * max);
}

function place_food()
{
    foodPosX = range(cols);
    foodPosY = range(rows);
}

function change_direction(event)
{
    if (event.code == "ArrowUp" && snakeVelocityY != 1)
    {
        snakeVelocityX = 0;
        snakeVelocityY = -1;
    }
    else if (event.code == "ArrowDown" && snakeVelocityY != -1)
    {
        snakeVelocityX = 0;
        snakeVelocityY = 1;
    }
    else if (event.code == "ArrowLeft" && snakeVelocityX != 1)
    {
        snakeVelocityX = -1;
        snakeVelocityY = 0;
    }
    else if (event.code == "ArrowRight" && snakeVelocityX != -1)
    {
        snakeVelocityX = 1;
        snakeVelocityY = 0;
    }
}