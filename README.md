# 🎮 Quadrilateral Quest - QR Code Game

A multi-device geometry quiz game that you can play with friends and classmates using QR codes!

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your computer ([Download here](https://nodejs.org/))

### Setup Instructions

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/67CAT123/Triangle-maths-game.git
   cd Triangle-maths-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

   You'll see output like:
   ```
   🎮 QUADRILATERAL QUEST - QR CODE SERVER 🎮
   ===============================================
   ✅ Server running on: http://192.168.1.100:3000
   📱 QR Code page: http://192.168.1.100:3000/qr
   🎯 Game page: http://192.168.1.100:3000/play
   ```

4. **Open the QR Code page**
   - Open your browser to the URL shown (e.g., `http://192.168.1.100:3000/qr`)
   - You'll see a QR code displayed

5. **Share with friends**
   - Have other people on the same WiFi network scan the QR code with their phones
   - They'll be directed to the game page and can start playing!

## 🎯 How to Play

- Answer 10 geometry riddles about quadrilaterals
- You have **20 seconds** per question
- Correct answer = **10 points**
- Wrong answer = **0 points**
- Try to get a perfect score of 100!

## 📱 Features

- ✨ Beautiful neon-themed UI
- ⏱️ 20-second timer per question
- 📊 Score tracking
- 🎲 Randomized questions
- 📱 Mobile-friendly design
- 🌐 Network-based multiplayer (everyone plays independently on their device)
- 🔗 Easy QR code sharing

## 🔧 Technical Details

- **Server**: Node.js with built-in HTTP module
- **QR Code**: Generated using the `qrcode` npm package
- **Frontend**: Pure HTML5, CSS3, and JavaScript (no external dependencies for the game itself)

## 📁 Project Structure

```
Triangle-maths-game/
├── qr-game-server.js      # Main server file
├── package.json           # Dependencies
├── README.md              # This file
└── QUEST maths homework.html  # Original game file
```

## 🐛 Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Try: `sudo lsof -i :3000` to check if something is using it

### Can't connect from other devices
- Make sure all devices are on the **same WiFi network**
- Check your firewall settings
- Use the IP address shown in the console, not "localhost"

### QR code not scanning
- Make sure your phone's camera app is updated
- Try a different QR code scanner app
- Check that the URL is correct

## 🎓 Questions Included

The game includes 10 challenging geometry questions about:
- Quadrilateral angles and ratios
- Rhombus properties and perimeter
- Parallelogram angle relationships
- Trapezoid medians
- Kite geometry
- Rectangle properties
- Isosceles trapezoids
- And more!

## 📝 License

MIT

## 👨‍💻 Author

Created for geometry homework practice!

---

**Enjoy the game and test your geometry knowledge! 🧮✨**
