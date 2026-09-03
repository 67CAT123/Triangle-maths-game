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
                    <title>Quadrilateral Quest - QR Code</title>
                    <style>
                        body { 
                            background: #0b0f19; 
                            color: white; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh; 
                            margin: 0;
                            font-family: 'Segoe UI', sans-serif;
                        }
                        .container {
                            text-align: center;
                            background: #1a1525;
                            padding: 40px;
                            border-radius: 20px;
                            border: 1px solid #333;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                        }
                        h1 { color: #00f2fe; text-transform: uppercase; letter-spacing: 2px; }
                        img { max-width: 400px; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; }
                        .url { 
                            background: #2a2535; 
                            padding: 15px; 
                            border-radius: 8px; 
                            margin: 20px 0;
                            word-break: break-all;
                            font-family: monospace;
                        }
                        .status { color: #00f2fe; font-size: 1.1rem; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>QUADRILATERAL QUEST</h1>
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
    <title>Quadrilateral Quest</title>
    <style>
        :root { --neon: #00f2fe; --bg: #0b0f19; --card: #1a1525; }
        body { background: var(--bg); color: white; font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 10px; }
        .box { background: var(--card); padding: 30px; border-radius: 20px; width: 90%; max-width: 500px; text-align: center; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: var(--neon); text-transform: uppercase; letter-spacing: 2px; }
        .instructions { background: rgba(0,242,254,0.1); padding: 15px; border-radius: 10px; margin: 20px 0; font-size: 0.9rem; border-left: 4px solid var(--neon); text-align: left; }
        .btn { background: linear-gradient(90deg, #00f2fe, #8e2de2); border: none; padding: 15px 30px; cursor: pointer; border-radius: 10px; font-weight: bold; color: #000; width: 100%; margin-top: 10px; transition: transform 0.2s; }
        .btn:hover { transform: scale(1.05); }
        .choice { display: block; width: 100%; padding: 12px; margin: 8px 0; background: #2a2535; border: 2px solid #444; color: white; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .choice:hover { border-color: var(--neon); background: #3a3545; }
        .choice.correct { background: #00aa00; border-color: #00ff00; }
        .choice.wrong { background: #aa0000; border-color: #ff0000; }
        .hidden { display: none; }
        #timer { font-size: 1.5rem; color: var(--neon); margin-bottom: 10px; font-weight: bold; }
        #timer.warning { animation: pulse 0.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .progress { background: #2a2535; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
        .progress-text { color: #888; font-size: 0.9rem; }
    </style>
</head>
<body>

<div id="start" class="box">
    <h1>QUADRILATERAL QUEST</h1>
    <div class="instructions">
        <strong>📚 How to Play:</strong><br>
        • You will face 10 geometry riddles.<br>
        • You have exactly <strong>20 seconds</strong> for each question.<br>
        • Select the right answer to gain 10 points.<br>
        • Keep an eye on the timer!
    </div>
    <button class="btn" onclick="start()">ENTER THE DUNGEON</button>
</div>

<div id="game" class="box hidden">
    <div class="progress">
        <div class="progress-text">Question <span id="questionNum">1</span>/10</div>
    </div>
    <div id="timer">20s</div>
    <h3 id="question">Question?</h3>
    <div id="options"></div>
</div>

<div id="end" class="box hidden">
    <h1>QUEST COMPLETE</h1>
    <h2 id="finalScore"></h2>
    <button class="btn" onclick="location.reload()">PLAY AGAIN</button>
</div>

<script>
    const data = [
        { q: "Largest angle in 1:2:3:4 ratio quad?", a: "144°", o: ["36°", "72°", "108°", "144°"] },
        { q: "Rhombus diagonals 6cm & 8cm. Perimeter?", a: "20cm", o: ["14cm", "20cm", "24cm", "28cm"] },
        { q: "Parallelogram angles (2x+10) & (3x-20). First angle?", a: "86°", o: ["38°", "76°", "86°", "94°"] },
        { q: "Trapezoid bases 10 and 22. Median?", a: "16", o: ["12", "16", "18", "32"] },
        { q: "Kite angles 40° and 100°. Side angle?", a: "110°", o: ["90°", "110°", "120°", "220°"] },
        { q: "Rectangle diagonals cross at 60°. Triangles face short sides?", a: "Equilateral", o: ["Right", "Scalene", "Isosceles", "Equilateral"] },
        { q: "Isosceles trapezoid base angles 70°. Top angles?", a: "110°", o: ["70°", "90°", "110°", "180°"] },
        { q: "Rhombus diagonal = side. Biggest angle?", a: "120°", o: ["60°", "90°", "120°", "150°"] },
        { q: "Diagonals equal, bisect, not 90°. What am I?", a: "Rectangle", o: ["Square", "Rhombus", "Rectangle", "Kite"] },
        { q: "Parallelogram perimeter 40cm. Sides diff 4. Shortest side?", a: "8cm", o: ["4cm", "6cm", "8cm", "12cm"] }
    ];

    let i = 0, score = 0, time, interval, answered = false;

    function start() {
        data.sort(() => Math.random() - 0.5);
        document.getElementById('start').classList.add('hidden');
        document.getElementById('game').classList.remove('hidden');
        next();
    }

    function next() {
        answered = false;
        if(i >= data.length) { 
            document.getElementById('game').classList.add('hidden'); 
            document.getElementById('end').classList.remove('hidden'); 
            document.getElementById('finalScore').innerText = "Score: " + score + " / 100"; 
            return;
        }
        
        document.getElementById('questionNum').innerText = i + 1;
        time = 20;
        document.getElementById('question').innerText = data[i].q;
        const optDiv = document.getElementById('options');
        optDiv.innerHTML = "";
        
        data[i].o.forEach(o => {
            let b = document.createElement('button');
            b.className = "choice";
            b.innerText = o;
            b.onclick = () => selectAnswer(b, o);
            optDiv.appendChild(b);
        });
        
        clearInterval(interval);
        updateTimer();
        interval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const timerDiv = document.getElementById('timer');
        timerDiv.innerText = time + "s";
        
        if(time <= 5) {
            timerDiv.classList.add('warning');
        } else {
            timerDiv.classList.remove('warning');
        }
        
        time--;
        if(time < 0) { 
            clearInterval(interval); 
            if(!answered) nextQuestion();
        }
    }

    function selectAnswer(btn, answer) {
        if(answered) return;
        answered = true;
        clearInterval(interval);
        
        const correct = answer === data[i].a;
        
        // Disable all buttons
        document.querySelectorAll('.choice').forEach(b => b.style.pointerEvents = 'none');
        
        if(correct) {
            btn.classList.add('correct');
            score += 10;
        } else {
            btn.classList.add('wrong');
            // Highlight correct answer
            document.querySelectorAll('.choice').forEach(b => {
                if(b.innerText === data[i].a) {
                    b.classList.add('correct');
                }
            });
        }
        
        setTimeout(nextQuestion, 1500);
    }

    function nextQuestion() {
        i++;
        next();
    }
</script>
</body>
</html>`;
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log('\n🎮 QUADRILATERAL QUEST - QR CODE SERVER 🎮');
    console.log('===============================================');
    console.log(`✅ Server running on: ${gameURL}`);
    console.log(`📱 QR Code page: ${gameURL}/qr`);
    console.log(`🎯 Game page: ${gameURL}/play`);
    console.log('\nInstructions:');
    console.log('1. Open http://' + localIP + ':' + PORT + '/qr in your browser');
    console.log('2. Scan the QR code with other devices');
    console.log('3. All devices must be on the same network\n');
});
