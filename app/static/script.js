const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const socket = io();

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let drawing = false;
let lastX = 0, lastY = 0;

const colors = [
    "rgb(255, 99, 132)",
    "rgb(54, 162, 235)",
    "rgb(255, 206, 86)",
    "rgb(75, 192, 192)",
    "rgb(153, 102, 255)",
    "rgb(255, 159, 64)",
    "rgb(199, 199, 199)",
    "rgb(100, 255, 218)",
    "rgb(255, 128, 128)",
    "rgb(128, 255, 128)"
];

const ctxChart = document.getElementById("prediction-chart").getContext("2d");
const chart = new Chart(ctxChart, {
    type: 'bar',
    data: {
        labels: Array.from({ length: 10 }, (_, i) => i.toString()),
        datasets: [{
            label: 'Prediction Confidence',
            data: Array(10).fill(0),
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('rgb', 'rgba').replace(')', ', 1)')),
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: colors,
                    font: {
                        size: 14
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    }
});

canvas.addEventListener("mousedown", e => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mousemove", e => {
    if (!drawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    const imageData = canvas.toDataURL("image/png");
    socket.emit("draw_data", imageData);
});

canvas.addEventListener("mouseout", () => drawing = false);

document.getElementById("clearCanvas").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("prediction").innerText = "?";
    chart.data.datasets[0].data = Array(10).fill(0);
    chart.update();
});

socket.on("prediction", (data) => {
    const { digit, confidence } = data;
    document.getElementById("prediction").innerText = digit;
    chart.data.datasets[0].data = confidence;
    chart.update();
});

socket.on("connect", () => console.log("WebSocket connected:", socket.id));
socket.on("disconnect", () => console.log("WebSocket disconnected"));
socket.on("connect_error", (error) => console.error("WebSocket connection error:", error));

const mlpCanvas = document.createElement("canvas");
mlpCanvas.width = 600;
mlpCanvas.height = 400;
mlpCanvas.style.border = "1px solid #ccc";
mlpCanvas.style.margin = "20px auto";
mlpCanvas.style.display = "block";
document.body.appendChild(mlpCanvas);

const mlpCtx = mlpCanvas.getContext("2d");

function drawMLP(ctx, activeLayer, progress) {
    const layers = [12, 10, 11, 10];
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    const layerSpacing = canvasWidth / (layers.length + 1);
    const nodeRadius = 10;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    layers.forEach((nodeCount, layerIndex) => {
        const x = layerSpacing * (layerIndex + 1);
        const nodeSpacing = canvasHeight / (nodeCount + 1);

        for (let i = 0; i < nodeCount; i++) {
            const y = nodeSpacing * (i + 1);

            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "rgb(0, 225, 255)";
            ctx.fill();
            ctx.strokeStyle = "#333";
            ctx.stroke();

            if (layerIndex > 0) {
                const prevNodeCount = layers[layerIndex - 1];
                const prevX = layerSpacing * layerIndex;
                const prevNodeSpacing = canvasHeight / (prevNodeCount + 1);

                for (let j = 0; j < prevNodeCount; j++) {
                    const prevY = prevNodeSpacing * (j + 1);

                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);

                    const targetX = prevX + (x - prevX) * progress;
                    const targetY = prevY + (y - prevY) * progress;

                    if (layerIndex === activeLayer) {
                        ctx.lineTo(targetX, targetY);
                        ctx.strokeStyle = "rgba(197, 242, 255, 0.8)";
                        ctx.lineWidth = 2;
                    } else {
                        ctx.lineTo(x, y);
                        ctx.strokeStyle = "rgb(0, 225, 255)";
                        ctx.lineWidth = 1;
                    }
                    ctx.stroke();
                }
            }
        }
    });
}

let currentLayer = 1;
let progress = 0;
function animateMLP() {
    progress += 0.02;
    if (progress > 1) {
        progress = 0;
        currentLayer++;
        if (currentLayer >= 4) currentLayer = 1;
    }

    drawMLP(mlpCtx, currentLayer, progress);
    requestAnimationFrame(animateMLP);
}

animateMLP();
