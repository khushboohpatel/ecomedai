from fastapi import FastAPI, File, UploadFile
import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import io

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ Load the trained model
MODEL_PATH = "models/resnet50_waste_classifier_7_classes.pth"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50()
num_features = model.fc.in_features
model.fc = torch.nn.Linear(num_features, 7)  # Ensure correct number of classes

model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.eval()  # Set model to evaluation mode
model.to(device)

# ✅ Define class labels (7-Class Model)
classes = [
    "General Waste - Metal & Glass",
    "General Waste - Organic",
    "General Waste - Paper",
    "General Waste - Plastic",
    "Infectious Waste",
    "Pathological Waste",
    "Sharps Waste"
]

# ✅ Define 4-Class Biomedical Waste Mapping
biomedical_mapping = {
    "Pathological Waste": "Red",
    "Infectious Waste": "Red",
    "General Waste - Organic": "Grey",
    "General Waste - Paper": "Grey",
    "General Waste - Plastic": "Blue",
    "General Waste - Metal & Glass": "Blue",
    "Sharps Waste": "White"
}

# ✅ Define image transformations (same as during training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# ✅ Define the API route for image prediction
@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    try:
        # ✅ Read and preprocess the image
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)  # Add batch dimension

        # ✅ Make prediction
        with torch.no_grad():
            output = model(image)
            _, predicted = torch.max(output, 1)

        predicted_class = classes[predicted.item()]
        mapped_category = biomedical_mapping.get(predicted_class, "Unknown Category")

        return {
            "prediction": predicted_class,
            "mapped_biomedical_category": mapped_category
        }

    except Exception as e:
        return {"error": str(e)}

# ✅ Run the API using:
# uvicorn app:app --host 0.0.0.0 --port 8000
