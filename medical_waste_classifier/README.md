# EcoMedAI - FastAPI Healthcare Waste Classification API

## 📌 Overview
This API classifies healthcare waste images using a trained ResNet50 model. It predicts whether the waste belongs to one of 7 categories.

## 🚀 Setup & Installation

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/the-sniper/ecomedai.git
cd ecomedai
```

### **2️⃣ Create a Virtual Environment (Optional but Recommended)**
```bash
python -m venv venv
source venv/bin/activate  # For Linux/macOS
venv\Scripts\activate   # For Windows
```

### **3️⃣ Install Dependencies**
```bash
pip install -r requirements.txt
```

### **4️⃣ Run the FastAPI Server**
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### **5️⃣ Test API using Swagger UI**
Once the server is running, open:
```
http://127.0.0.1:8000/docs
```
You can upload an image and test the API.

## 📌 API Endpoint
### **POST /predict/**
- **Request**: Upload an image file (`.jpg`, `.png`).
- **Response**: Returns the predicted waste category.

## 📌 Example API Call (Using Python)
```python
import requests

url = "http://127.0.0.1:8000/predict/"
file_path = "test_image.jpg"

with open(file_path, "rb") as image_file:
    files = {"file": image_file}
    response = requests.post(url, files=files)

print(response.json())  # ✅ Expected: {'prediction': 'Infectious Waste'}
```

## 📌 License
This project is under the **MIT License**.

---
🔥 **Built with FastAPI & PyTorch** | 🌎 **AI for Sustainable Waste Management**
