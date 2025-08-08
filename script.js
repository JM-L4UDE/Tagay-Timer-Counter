let players = JSON.parse(localStorage.getItem("players")) || [];
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || 0;
let countdown;
let timeLeft;
let countdownSeconds = parseInt(localStorage.getItem("countdownSeconds")) || 10;
let isPaused = false;

window.onload = () => {
    let minSel = document.getElementById("minutesSelect");
    let secSel = document.getElementById("secondsSelect");

    for (let i = 0; i <= 5; i++) {
        minSel.innerHTML += `<option value="${i}">${i}</option>`;
    }
    for (let i = 0; i < 60; i++) {
        secSel.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
    }

    updateTable();
    if (players.length > 0) {
        document.querySelector(".setup").style.display = "none";
        document.getElementById("gameArea").style.display = "block";
        nextTurn();
    }
};

function saveGameState() {
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("currentIndex", currentIndex);
    localStorage.setItem("countdownSeconds", countdownSeconds);
}

function addPlayer() {
    const name = document.getElementById('playerName').value.trim();
    if (name) {
        players.push({ name: name, shots: 0, skips: 5 });
        updateTable();
        document.getElementById('playerName').value = '';
        saveGameState();
    }
}

function updateTable() {
    const table = document.getElementById('playerTable');
    table.innerHTML = `<tr><th>Mga Parahubog</th><th>Pila na ka Tagay</th><th>Nahabilin nga Pass</th></tr>`;
    players.forEach(p => {
        table.innerHTML += `<tr><td>${p.name}</td><td>${p.shots}</td><td>${p.skips}</td></tr>`;
    });
}

function startTagay() {
    if (players.length === 0) {
        alert("Add players first!");
        return;
    }
    let mins = parseInt(document.getElementById("minutesSelect").value) * 60;
    let secs = parseInt(document.getElementById("secondsSelect").value);
    countdownSeconds = mins + secs || 10;
    currentIndex = 0;
    document.querySelector(".setup").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    saveGameState();
    nextTurn();
}

function nextTurn() {
    clearInterval(countdown);
    isPaused = false;
    timeLeft = countdownSeconds;
    document.getElementById('timer').textContent = formatTime(timeLeft);
    document.getElementById('currentPlayer').textContent = `Imo Tagay ${players[currentIndex].name}!`;

    countdown = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            document.getElementById('timer').textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(countdown);
                playTagayVideo();
            }
        }
    }, 1000);
}

function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function playerDrank() {
    players[currentIndex].shots++;
    updateTable();
    saveGameState();
    moveToNextPlayer();
}

function skipTurn() {
    if (players[currentIndex].skips > 0) {
        players[currentIndex].skips--;
        updateTable();
        saveGameState();
        moveToNextPlayer();
    } else {
        alert(`${players[currentIndex].name}, hurot na imo pass!`);
    }
}

function moveToNextPlayer() {
    document.getElementById('tagayVideo').pause();
    document.getElementById('videoArea').style.display = "none";
    currentIndex = (currentIndex + 1) % players.length;
    saveGameState();
    nextTurn();
}

function confirmReset() {
    Swal.fire({
        title: "Do you want to reset?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "#d63031",
        cancelButtonColor: "#636e72"
    }).then((result) => {
        if (result.isConfirmed) {
            resetGame();
        }
    });
}

function resetGame() {
    localStorage.clear();
    players = [];
    currentIndex = 0;
    clearInterval(countdown);
    document.getElementById("gameArea").style.display = "none";
    document.querySelector(".setup").style.display = "block";
    updateTable();
}

function pauseTimer() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? "Resume" : "Pause";
}

function playTagayVideo() {
    isPaused = true;
    let videoArea = document.getElementById('videoArea');
    let video = document.getElementById('tagayVideo');
    let sound = new Audio("tagay.mp3");

    videoArea.style.display = "block";
    video.currentTime = 0;
    video.play().catch(err => console.log("Video play blocked:", err));
    sound.play().catch(err => console.log("Sound play blocked:", err));
}
