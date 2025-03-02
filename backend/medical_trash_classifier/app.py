from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from torchvision import models
import io
import os
import torch
import torchvision.transforms as transforms

app = FastAPI(
    title="EcoMedAI - Medical Trash Classifier API",
    description="API to process medical waste images and classify them into categories",
    version="1.0"
)

# Enable CORS for frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Calculate the directory where this script resides
current_dir = os.path.dirname(os.path.abspath(__file__))
# Load the trained model
MODEL_PATH = os.path.join(current_dir, "models", "medical_trash_classifier.pth")


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50()
num_features = model.fc.in_features
model.fc = torch.nn.Linear(num_features, 7)

try:
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()
    model.to(device)
except Exception as e:
    raise RuntimeError(f"Error loading model: {str(e)}")

# Define class labels (7-Class Model)
classes = [
    "General Waste - Metal & Glass",
    "General Waste - Organic",
    "General Waste - Paper",
    "General Waste - Plastic",
    "Infectious Waste",
    "Pathological Waste",
    "Sharps Waste"
]

# Define 4-Class Biomedical Waste Mapping
biomedical_mapping = {
    "Pathological Waste": "Red",
    "Infectious Waste": "Red",
    "General Waste - Organic": "Grey",
    "General Waste - Paper": "Grey",
    "General Waste - Plastic": "Blue",
    "General Waste - Metal & Glass": "Blue",
    "Sharps Waste": "White"
}

# Define image transformations (same as during training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])


@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    """
    API endpoint for predicting the waste category from an image.

    Args:
        file (UploadFile): The uploaded image file.

    Returns:
        dict: A dictionary containing the predicted category and mapped biomedical category.
    """
    try:
        # Ensure the file is an image
        if not file.filename.lower().endswith(("png", "jpg", "jpeg", "bmp", "tiff")):
            raise HTTPException(status_code=400, detail="Invalid file format. Please upload an image.")

        # Read and preprocess the image
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        # Make prediction
        with torch.no_grad():
            output = model(image)
            _, predicted = torch.max(output, 1)

        predicted_class = classes[predicted.item()]
        mapped_category = biomedical_mapping.get(predicted_class, "Unknown Category")

        return {
            "prediction": predicted_class,
            "mapped_biomedical_category": mapped_category
        }

    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

