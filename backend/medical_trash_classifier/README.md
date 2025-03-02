# EcoMedAI - FastAPI Healthcare Waste Classification API

##  Overview
This API classifies medical waste images using a trained ResNet50 model. It predicts whether the waste belongs to one of 7 categories and further classifies them to map respective colour bins.

##  Setup & Installation

### **1️. Clone the Repository**
```bash
git clone https://github.com/the-sniper/ecomedai.git
cd ecomedai
```

### **2️. Create a Virtual Environment (Optional but Recommended)**
```bash
python -m venv venv
source venv/bin/activate  # For Linux/macOS
venv\Scripts\activate   # For Windows
```

### **3️. Install Dependencies**
```bash
pip install fastapi uvicorn torch torchvision pillow
```

### **4️. Run the FastAPI Server**
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### **5️. Test API using Swagger UI**
Once the server is running, open:
```
http://127.0.0.1:8000/docs
```
You can upload an image and test the API.

##  API Endpoint
### **POST /predict/**
- **Request**: Upload an image file (`.jpg`, `.png`).
- **Response**: Returns the predicted medical waste category.

##  Example API Call (Using Python)
```python
import requests

url = "http://127.0.0.1:8000/predict/"
file_path = "test_image.jpg"

with open(file_path, "rb") as image_file:
    files = {"file": image_file}
    response = requests.post(url, files=files)

print(response.json())  # Expected: {'prediction': 'Infectious Waste'}
```

## License
This project is under the **MIT License**.

