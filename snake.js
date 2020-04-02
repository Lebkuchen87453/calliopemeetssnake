/*
 * calliopemeetssnake
 * by Kilian Friedrich
 *
 * This Snake game uses the gyroscope sensor and the 5x5 LED grid of a Calliope Mini to work.
 * 
 * MIT License
 * 2019-07-03
 */

basic.showString("3 2 1");  // countdown, showString pauses the program until the string finished appearing

/*
 * The snake is stored as an array of parts,
 * each part itself is represented as an array of x, y and its direction.
 */
let snake = [[2, 2, 0], [1, 2, 0]];

let appleX: number;  // x position of the apple
let appleY: number;  // y position of the apple
newApple();  // initialize apple

render();  // show first string and
while (isAlive()) {  // start game loop

        basic.pause(700);  // 700ms (+ processing time) per frame

        moveSnake();

        if(appleX === snake[0][0] && appleY === snake[0][1]) {  // if apple is eaten

            appendToSnake();  // make snake longer
            newApple();  // relocate apple to a clear spot

        }

        basic.clearScreen();  // remove existing stuff from the display and
        render();  // draw new stuff

}

basic.showString("Game over");  // end game, restart the program to play again

// ########## METHODS ##########

// spawns an apple at a free position (stored in appleX & appleY)
// doesn't return when the max length is archieved => doesn't show "Game Over", needs a hard reset
function newApple() {

    do {

        appleX = Math.random(5);
        appleY = Math.random(5);

    } while(snakeCoversApple());

}

// returns whether the apple is touching the snake,
// used to spawn new apples
function snakeCoversApple() {

    for (let i = 0; i < snake.length; i++)
        if (snake[i][0] === appleX && snake[i][1] === appleY)
            return true;

    return false;

}

// renders a part of the snake (with index index) to the 5x5 LED grid
function render(index = 0) {

    if (index === snake.length) {  // draw the apple in last function call

        led.toggle(appleX, appleY);
        return;

    }

    led.toggle(snake[index][0], snake[index][1]);
    render(index + 1);  // draw next part

}

// returns whether the snake crashes into a wall or itself (=> returns false) or not (=> returns true)
function isAlive() {

    let headX = snake[0][0];
    let headY = snake[0][1];

    // check if any snake part touches its head
    for (let i = 1; i < snake.length; i++)
        if (snake[i][0] === headX && snake[i][1] === headY)
            return false;
        
    // check if head is out of bounds
    return headX >= 0 && headX <= 4 && headY >= 0 && headY <= 4;

}

// moves the snake by removing the last part and appending to its head
function moveSnake() {

    // read gyroscope data
    let rightTilt = getTiltToRight();
    let downTilt = getTiltToBottom();
    let leftTilt = getTiltToLeft();
    let upTilt = getTiltToTop();

    // get current direction of snake's head
    let snakeDirection = snake[0][2];

    // parse gyroscope data
    let xTiltDirection = (rightTilt >= leftTilt) ? 0 : 2;
    let xTiltValue = (xTiltDirection === 0) ? rightTilt : leftTilt;
    let yTiltDirection = (downTilt >= upTilt) ? 1 : 3;
    let yTiltValue = (yTiltDirection === 1) ? downTilt : upTilt;

    // call external functions to do the actual work
    if (xTiltDirection === 0 && (xTiltValue >= yTiltValue || Math.abs(yTiltDirection - snakeDirection) === 2))
        moveRight();
    else if (yTiltDirection === 1 && (yTiltValue > xTiltValue || Math.abs(xTiltDirection - snakeDirection) === 2))
        moveDown();
    else if (xTiltDirection === 2 && (xTiltValue >= yTiltValue || Math.abs(yTiltDirection - snakeDirection) === 2))
        moveLeft();
    else if (yTiltDirection === 3 && (yTiltValue > xTiltValue || Math.abs(xTiltDirection - snakeDirection) === 2))
        moveUp();

}

function moveRight() {

    snake[0][2] = 0;
    move()

}
function moveDown() {

    snake[0][2] = 1;
    move()

}
function moveLeft() {

    snake[0][2] = 2;
    move()

}
function moveUp() {

    snake[0][2] = 3;
    move()

}

// moves the snake into a direction
function move(direction: number = -1, index: number = 0) {

    if (index === snake.length) return;  // end recursive stack

    // move the part
    switch (snake[index][2]) {

        case 0: snake[index][0]++; break;
        case 1: snake[index][1]++; break;
        case 2: snake[index][0]--; break;
        case 3: snake[index][1]--; break;

    }

    move(snake[index][2], index + 1);  // move next part

    snake[index][2] = direction;  // set direction to the direction of the predecessor

}

// makes the snake longer after eating an apple
function appendToSnake() {

    // add part depending on which direction the tail is heading
    switch (snake[snake.length - 1][2]) {

        case 0: snake.push([snake[snake.length - 1][0] - 1, snake[snake.length - 1][1], 0]); break;
        case 1: snake.push([snake[snake.length - 1][0], snake[snake.length - 1][1] - 1, 1]); break;
        case 2: snake.push([snake[snake.length - 1][0] + 1, snake[snake.length - 1][1], 2]); break;
        case 3: snake.push([snake[snake.length - 1][0], snake[snake.length - 1][1] + 1, 3]); break;

    }

}

// DON'T TOUCH THAT. IT WORKS.

function getXRotation() { return input.rotation(Rotation.Roll) }
function getYRotation() { return input.rotation(Rotation.Pitch) }

function getTiltToLeft() { return Math.abs(getXRotation()) === 180 ? 0 : (getXRotation() < 0 ? getXRotation() + 180 : getXRotation() - 180) }
function getTiltToRight() { return Math.abs(getXRotation()) === 180 ? 0 : (getXRotation() > 0 ? -getXRotation() + 180 : -getXRotation() - 180) }
function getTiltToTop() { return Math.abs(getYRotation()) === 180 ? 0 : -getYRotation() }
function getTiltToBottom() { return Math.abs(getYRotation()) === 180 ? 0 : getYRotation() }
