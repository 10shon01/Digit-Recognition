# Real-Time Handwritten Digit Recognition Application

This application allows users to draw handwritten digits on a Canvas, recognizes them in real-time, and visualizes the prediction results and confidence distribution as a web application.

## Features
- **Real-Time Recognition**: Handwritten digits are sent to the server immediately after being drawn, and the recognition results are returned in real-time.
- **Confidence Visualization**: Displays the prediction confidence for each digit as a bar graph using Chart.js.
- **Modern Tech Stack**: Combines deep learning (PyTorch), real-time communication (Socket.IO), and web technologies.

---

## Technologies Used

### Frontend
- **HTML/CSS/JavaScript**: For building the user interface.
- **Canvas API**: Provides the drawing area for user input.
- **Chart.js**: Interactive bar graph to visualize prediction confidence.

### Backend
- **Flask**: A lightweight Python-based web framework.
- **Flask-SocketIO**: Enables bidirectional communication between the client and server.
- **PyTorch**: Performs inference using a pre-trained Convolutional Neural Network (CNN) on the MNIST dataset.

---

## Features Overview

1. **Handwritten Digit Recognition**  
   - Users draw digits on a Canvas, and the images are sent to the server in real-time.
   - The server uses a pre-trained CNN model built with PyTorch to perform inference.
   - The recognition results (predicted digit and confidence distribution) are sent back to the client.

2. **Frontend Features**  
   - Provides an interactive Canvas for drawing.
   - Sends the drawn image in binary format to the server.
   - Visualizes the prediction results using Chart.js.

3. **Backend Features**  
   - Implements the server with Flask.
   - Enables real-time communication using Flask-SocketIO.

---