from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import torch
from torchvision import transforms
from PIL import Image,ImageOps
import io
import base64

app = Flask(__name__)
socketio = SocketIO(app)

model_path = "app/model/mnist_cnn.pth"
net = torch.nn.Sequential(
    torch.nn.Conv2d(1, 32, 3, 1),
    torch.nn.ReLU(),
    torch.nn.MaxPool2d(2, 2),
    torch.nn.Dropout(0.1),
    torch.nn.Conv2d(32, 64, 3, 1),
    torch.nn.ReLU(),
    torch.nn.MaxPool2d(2, 2),
    torch.nn.Dropout(0.1),
    torch.nn.Flatten(),
    torch.nn.Linear(64 * 5 * 5, 256),
    torch.nn.ReLU(),
    torch.nn.Linear(256, 10)
)
net.load_state_dict(torch.load(model_path, map_location=torch.device('cpu'), weights_only=True))
net.eval()

def predict_digit(image_data):
    image = Image.open(io.BytesIO(image_data)).convert("L")
    
    image = image.resize((28, 28))
    
    image = ImageOps.invert(image)
    image.save("debug_inverted_image.png") 
    transform = transforms.Compose([
        transforms.ToTensor(),
    ])
    image = transform(image).unsqueeze(0)  
    
    with torch.no_grad():
        output = net(image)
        digit = output.argmax(dim=1).item()
    return digit

@app.route("/")
def index():
    return render_template("index.html")

def predict_digit(image_data):
    image = Image.open(io.BytesIO(image_data)).convert("L")
    image = image.resize((28, 28))
    image = ImageOps.invert(image)
    transform = transforms.Compose([transforms.ToTensor()])
    image = transform(image).unsqueeze(0)
    
    with torch.no_grad():
        output = net(image)
        probabilities = torch.nn.functional.softmax(output, dim=1).squeeze().tolist()
        digit = output.argmax(dim=1).item()
    
    return digit, probabilities

@socketio.on("draw_data")
def handle_draw(data):
    try:
        image_data = base64.b64decode(data.split(",")[1])
        digit, probabilities = predict_digit(image_data)
        emit("prediction", {"digit": digit, "confidence": probabilities})
    except Exception as e:
        print(f"Error: {e}")



if __name__ == "__main__":
    socketio.run(app, debug=True)
