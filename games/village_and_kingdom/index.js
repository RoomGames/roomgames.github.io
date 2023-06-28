console.log("Hello, Village and Kingdom!");

let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

context.fillStyle = "white"
context.fillRect(0, 0, canvas.width, canvas.height);

console.log(canvas);
console.log(context);

let image = new Image();
image.src = "./resources/map.png";

image.onload = () => {
    context.drawImage(image, 0, 0);
};