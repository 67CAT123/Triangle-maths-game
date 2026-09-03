const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const PORT = 3000;
const localIP = getLocalIP();
const gameURL = `http://${localIP}:${PORT}`;

// Create server
const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // QR Code endpoint
    if (req.url === '/qr') {
        try {
            const qrCode = await QRCode.toDataURL(gameURL + '/play');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Triangle Treasure Hunt - QR Code</title>
                    <style>
                        body { 
                            background: linear-gradient(135deg, #06283D, #1363DF, #47B5FF);
                            color: white; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh; 
                            margin: 0;
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            text-align: center;
                            background: rgba(0, 0, 0, 0.65);
                            padding: 40px;
                            border-radius: 25px;
                            border: 2px solid gold;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                        }
                        h1 { color: gold; font-size: 36px; text-transform: uppercase; letter-spacing: 2px; }
                        img { max-width: 400px; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; }
                        .url { 
                            background: rgba(255,255,255,0.1); 
                            padding: 15px; 
                            border-radius: 8px; 
                            margin: 20px 0;
                            word-break: break-all;
                            font-family: monospace;
                        }
                        .status { color: gold; font-size: 1.1rem; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🏴‍☠️ Triangle Treasure Hunt</h1>
                        <p class="status">📱 Scan this QR code on another device:</p>
                        <img src="${qrCode}" alt="QR Code">
                        <p class="status">Or visit:</p>
                        <div class="url">${gameURL}/play</div>
                        <p>Make sure all devices are on the same network!</p>
                    </div>
                </body>
                </html>
            `);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error generating QR code: ' + err.message);
        }
    }
    
    // Game page
    else if (req.url === '/play') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getGameHTML());
    }

    // Root redirects to QR
    else if (req.url === '/') {
        res.writeHead(302, { 'Location': '/qr' });
        res.end();
    }

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

function getGameHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Triangle Treasure Hunt</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #06283D, #1363DF, #47B5FF);
    min-height: 100vh;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
}

.game-container {
    width: 95%;
    max-width: 750px;
    background: rgba(0, 0, 0, 0.65);
    padding: 30px;
    border-radius: 25px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

h1 {
    font-size: 38px;
    margin-bottom: 5px;
}

.subtitle {
    font-size: 18px;
    margin-bottom: 20px;
}

.stats {
    display: flex;
    justify-content: space-around;
    background: rgba(255,255,255,0.1);
    padding: 12px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 18px;
}

.progress-container {
    width: 100%;
    height: 12px;
    background: #555;
    border-radius: 10px;
    margin-bottom: 25px;
}

.progress-bar {
    height: 100%;
    width: 0%;
    background: gold;
    border-radius: 10px;
    transition: width 0.4s;
}

#question {
    font-size: 23px;
    line-height: 1.5;
}

.answer-button {
    width: 90%;
    max-width: 600px;
    margin: 10px auto;
    padding: 15px;
    display: block;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    cursor: pointer;
    background: white;
    color: #06283D;
    transition: 0.2s;
}

.answer-button:hover {
    transform: scale(1.03);
    background: gold;
}

.correct {
    background: #28a745 !important;
    color: white !important;
}

.wrong {
    background: #dc3545 !important;
    color: white !important;
}

#message {
    min-height: 30px;
    font-size: 19px;
    font-weight: bold;
}

.next-button,
.restart-button,
.start-button {
    padding: 14px 30px;
    border: none;
    border-radius: 12px;
    background: gold;
    color: #06283D;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    margin-top: 10px;
}

.next-button:hover,
.restart-button:hover,
.start-button:hover {
    transform: scale(1.05);
}

#start-screen {
    display: block;
}

#game-screen {
    display: none;
}

#end-screen {
    display: none;
}

.treasure {
    font-size: 90px;
    animation: bounce 1s infinite alternate;
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-15px);
    }
}

.instructions {
    text-align: left;
    background: rgba(255,255,255,0.1);
    padding: 18px;
    border-radius: 12px;
    margin: 20px 0;
}

.instructions li {
    margin: 8px 0;
}

@media(max-width:600px) {

    h1 {
        font-size: 29px;
    }

    #question {
        font-size: 19px;
    }

    .stats {
        font-size: 15px;
    }

    .game-container {
        padding: 20px;
    }

}

</style>
</head>

<body>

<div class="game-container">

<!-- START SCREEN -->

<div id="start-screen">

<h1>🏴‍☠️ Triangle Treasure Hunt</h1>

<p class="subtitle">
Test your Grade 8 geometry skills and find the hidden treasure!
</p>

<div class="treasure">💰</div>

<div class="instructions">

<h2>📜 Rules</h2>

<ul>

<li>Answer 10 mathematics challenges.</li>

<li>Each correct answer gives you <b>10 coins</b> 🪙.</li>

<li>You start with <b>3 lives</b> ❤️.</li>

<li>A wrong answer costs one life.</li>

<li>The questions cover similar triangles, angles, ratios and scale factors.</li>

<li>Try to score at least <b>80/100</b> to become a Triangle Treasure Master!</li>

</ul>

</div>

<button class="start-button" onclick="startGame()">
⚔️ Start Adventure
</button>

</div>


<!-- GAME SCREEN -->

<div id="game-screen">

<h1>🏴‍☠️ Triangle Treasure Hunt</h1>

<div class="stats">

<div>
🪙 Score:
<span id="score">0</span>
</div>

<div>
❤️ Lives:
<span id="lives">3</span>
</div>

<div>
📍 Question:
<span id="question-number">1</span>/10
</div>

</div>

<div class="progress-container">

<div class="progress-bar" id="progress"></div>

</div>

<h2 id="question"></h2>

<div id="answers"></div>

<p id="message"></p>

<button
class="next-button"
id="next-button"
onclick="nextQuestion()"
style="display:none;">
Next Challenge ➡️
</button>

</div>


<!-- END SCREEN -->

<div id="end-screen">

<div class="treasure">
🏆
</div>

<h1>Adventure Complete!</h1>

<h2 id="final-score"></h2>

<p id="final-message"></p>

<button class="restart-button" onclick="restartGame()">
🔄 Play Again
</button>

</div>

</div>


<script>

/* =========================
   GAME VARIABLES
========================= */

let score = 0;
let lives = 3;
let currentQuestion = 0;


/* =========================
   QUESTIONS
========================= */

const questions = [

{
    question:
    "Two triangles have angles of 50°, 60°, and 70°. What can you conclude?",

    answers: [
        "They are similar",
        "They have equal areas",
        "They are squares",
        "They cannot be compared"
    ],

    correct: 0
},

{
    question:
    "Two similar triangles have a corresponding angle of 65°. What is the matching angle in the other triangle?",

    answers: [
        "25°",
        "65°",
        "115°",
        "130°"
    ],

    correct: 1
},

{
    question:
    "Two similar triangles have corresponding sides in the ratio 2:3. If a side of the smaller triangle is 8 cm, what is the corresponding side of the larger triangle?",

    answers: [
        "10 cm",
        "12 cm",
        "16 cm",
        "24 cm"
    ],

    correct: 1
},

{
    question:
    "A triangle has a side length of 7 cm. It is enlarged by a scale factor of 3. What is the new side length?",

    answers: [
        "10 cm",
        "14 cm",
        "21 cm",
        "28 cm"
    ],

    correct: 2
},

{
    question:
    "A triangle has angles of 45° and 75°. What is its third angle?",

    answers: [
        "50°",
        "60°",
        "70°",
        "80°"
    ],

    correct: 1
},

{
    question:
    "The corresponding sides of two similar triangles are 5 cm and 15 cm. What is the ratio of the smaller side to the larger side?",

    answers: [
        "1:2",
        "1:3",
        "2:3",
        "3:1"
    ],

    correct: 1
},

{
    question:
    "A triangle with a side of 12 cm is reduced using a scale factor of 1/2. What is the new side length?",

    answers: [
        "4 cm",
        "6 cm",
        "8 cm",
        "10 cm"
    ],

    correct: 1
},

{
    question:
    "Triangle A has sides 4 cm, 6 cm, and 8 cm. Triangle B has sides 8 cm, 12 cm, and 16 cm. Are they similar?",

    answers: [
        "Yes",
        "No",
        "Only their angles are similar",
        "Not enough information"
    ],

    correct: 0
},

{
    question:
    "The scale factor from Triangle A to Triangle B is 4. If a side of Triangle A is 5 cm, what is the corresponding side of Triangle B?",

    answers: [
        "9 cm",
        "15 cm",
        "20 cm",
        "25 cm"
    ],

    correct: 2
},

{
    question:
    "Two similar triangles have corresponding sides of 6 cm and 18 cm. If another side of the smaller triangle is 10 cm, what is the corresponding side of the larger triangle?",

    answers: [
        "20 cm",
        "24 cm",
        "28 cm",
        "30 cm"
    ],

    correct: 3
}

];


/* =========================
   START GAME
========================= */

function startGame() {

    score = 0;
    lives = 3;
    currentQuestion = 0;

    document.getElementById("start-screen").style.display = "none";

    document.getElementById("game-screen").style.display = "block";

    document.getElementById("end-screen").style.display = "none";

    updateStats();

    showQuestion();

}


/* =========================
   SHOW QUESTION
========================= */

function showQuestion() {

    const question = questions[currentQuestion];

    document.getElementById("question").textContent =
        question.question;

    document.getElementById("question-number").textContent =
        currentQuestion + 1;

    document.getElementById("progress").style.width =
        ((currentQuestion) / questions.length * 100) + "%";

    document.getElementById("message").textContent = "";

    document.getElementById("next-button").style.display = "none";

    const answersContainer =
        document.getElementById("answers");

    answersContainer.innerHTML = "";

    question.answers.forEach(function(answer, index) {

        const button =
            document.createElement("button");

        button.textContent = answer;

        button.className = "answer-button";

        button.onclick = function() {

            checkAnswer(index, button);

        };

        answersContainer.appendChild(button);

    });

}


/* =========================
   CHECK ANSWER
========================= */

function checkAnswer(selected, selectedButton) {

    const question = questions[currentQuestion];

    const buttons =
        document.querySelectorAll(".answer-button");

    buttons.forEach(function(button) {

        button.disabled = true;

    });


    if(selected === question.correct) {

        score += 10;

        selectedButton.classList.add("correct");

        document.getElementById("message").textContent =
            "✅ Correct! You earned 10 coins! 🪙";

    }

    else {

        lives--;

        selectedButton.classList.add("wrong");

        buttons[question.correct].classList.add("correct");

        document.getElementById("message").textContent =
            "❌ Incorrect! The correct answer is highlighted.";

    }


    updateStats();


    if(lives <= 0) {

        setTimeout(function() {

            endGame();

        }, 1200);

        return;

    }


    document.getElementById("next-button").style.display =
        "inline-block";

}


/* =========================
   NEXT QUESTION
========================= */

function nextQuestion() {

    currentQuestion++;

    if(currentQuestion >= questions.length) {

        endGame();

    }

    else {

        showQuestion();

    }

}


/* =========================
   UPDATE SCORE/LIVES
========================= */

function updateStats() {

    document.getElementById("score").textContent =
        score;

    document.getElementById("lives").textContent =
        lives;

}


/* =========================
   END GAME
========================= */

function endGame() {

    document.getElementById("game-screen").style.display =
        "none";

    document.getElementById("end-screen").style.display =
        "block";

    document.getElementById("progress").style.width =
        "100%";

    document.getElementById("final-score").textContent =
        "Your Final Score: " + score + " / 100";


    let message;


    if(score >= 80) {

        message =
            "🎉 Amazing! You are a Triangle Treasure Master!";

    }

    else if(score >= 50) {

        message =
            "👏 Good job! Keep practising to become a master!";

    }

    else {

        message =
            "📚 Keep practising! You can find the treasure next time!";

    }


    document.getElementById("final-message").textContent =
        message;

}


/* =========================
   RESTART
========================= */

function restartGame() {

    document.getElementById("end-screen").style.display =
        "none";

    document.getElementById("start-screen").style.display =
        "block";

}

</script>
</body>
</html>`;
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log('\n🏴‍☠️ TRIANGLE TREASURE HUNT - QR CODE SERVER 🏴‍☠️');
    console.log('===============================================');
    console.log(`✅ Server running on: ${gameURL}`);
    console.log(`📱 QR Code page: ${gameURL}/qr`);
    console.log(`🎯 Game page: ${gameURL}/play`);
    console.log('\nInstructions:');
    console.log('1. Open http://' + localIP + ':' + PORT + '/qr in your browser');
    console.log('2. Scan the QR code with other devices');
    console.log('3. All devices must be on the same network\n');
});
