from PIL import Image, UnidentifiedImageError
from torch.utils.data import Dataset, DataLoader
from torchvision.models import ResNet50_Weights
import glob
import matplotlib.pyplot as plt
import os
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
import torchvision.models as models
import torch.backends.cudnn as cudnn
import zipfile

# Step 1: Unzip the dataset if not already extracted
zip_path = "philly_code_fest.zip"
extract_path = "Medical_waste_WHO_standard_ext"

if not os.path.exists(extract_path):
    print("Extracting dataset...")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        print("Dataset unzipped successfully.")
    except zipfile.BadZipFile:
        raise RuntimeError("Error: The ZIP file is corrupted or invalid.")
else:
    print("Dataset already extracted.")

# Step 2: Define dataset path
dataset_path = os.path.join(extract_path, "philly_code_fest/Medical_waste_WHO_standard/Dataset")

# Enable memory optimizations
cudnn.benchmark = True
cudnn.enabled = True

# Check if GPU is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)


class MedicalWasteDataset(Dataset):
    """
    Custom PyTorch Dataset to load medical waste images while filtering out non-image files.
    """

    def __init__(self, root_dir, transform=None):
        """
        Initializes the dataset by scanning directories and mapping labels.
        
        Args:
            root_dir (str): Path to the dataset directory.
            transform (torchvision.transforms): Transformations to apply to images.
        """
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        self.class_to_idx = {
            "General Waste - Metal & Glass": 0,
            "General Waste - Organic": 1,
            "General Waste - Paper": 2,
            "General Waste - Plastic": 3,
            "Infectious Waste": 4,
            "Pathological Waste": 5,
            "Sharps Waste": 6
        }

        valid_extensions = (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".gif")

        for class_name, class_idx in self.class_to_idx.items():
            train_folder = os.path.join(root_dir, class_name, "Train images")
            test_folder = os.path.join(root_dir, class_name, "Test images")

            for folder in [train_folder, test_folder]:
                if os.path.exists(folder):
                    for img_path in glob.glob(os.path.join(folder, "*.*")):
                        if img_path.lower().endswith(valid_extensions):
                            self.image_paths.append(img_path)
                            self.labels.append(class_idx)

    def __len__(self):
        """Returns the total number of images in the dataset."""
        return len(self.image_paths)

    def __getitem__(self, idx):
        """Retrieves an image and its label, applying transformations."""
        img_path = self.image_paths[idx]
        label = self.labels[idx]

        try:
            image = Image.open(img_path).convert("RGB")
            if self.transform:
                image = self.transform(image)
        except UnidentifiedImageError:
            print(f"Skipping corrupt file: {img_path}")
            return self.__getitem__((idx + 1) % len(self.image_paths))

        return image, label


# Define transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.CenterCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Load dataset using custom loader
dataset = MedicalWasteDataset(dataset_path, transform=transform)

# Split dataset into 80% Train, 20% Test
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = torch.utils.data.random_split(dataset, [train_size, test_size])

# Create DataLoaders
train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True, num_workers=2)
test_loader = DataLoader(test_dataset, batch_size=8, shuffle=False, num_workers=2)

print(f"Total training samples: {len(train_dataset)}")
print(f"Total testing samples: {len(test_dataset)}")
print("Classes:", dataset.class_to_idx)


# Load ResNet50 model
model = models.resnet50(weights=ResNet50_Weights.DEFAULT)

# Modify final layer for 7-class classification
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 7)
model = model.to(device)

# Define loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training Loop
num_epochs = 15
train_losses, test_losses = [], []
train_accuracies, test_accuracies = [], []

for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    correct_train, total_train = 0, 0

    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        correct_train += (predicted == labels).sum().item()
        total_train += labels.size(0)

    train_accuracy = correct_train / total_train
    train_losses.append(running_loss / len(train_loader))
    train_accuracies.append(train_accuracy)

    # Evaluate on test set
    model.eval()
    test_loss = 0.0
    correct_test, total_test = 0, 0

    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)
            test_loss += loss.item()

            _, predicted = torch.max(outputs, 1)
            correct_test += (predicted == labels).sum().item()
            total_test += labels.size(0)

    test_accuracy = correct_test / total_test
    test_losses.append(test_loss / len(test_loader))
    test_accuracies.append(test_accuracy)

    print(f"Epoch {epoch+1}/{num_epochs} | Train Loss: {train_losses[-1]:.4f} | Train Acc: {train_accuracy:.4f} | Test Acc: {test_accuracy:.4f}")

# Save the trained model
os.makedirs("models", exist_ok=True)
model_save_path = "models/medical_trash_classifier.pth"
torch.save(model.state_dict(), model_save_path)
print(f"Model training completed and saved at {model_save_path}")

# Plot Loss vs. Epochs
plt.figure(figsize=(10, 5))
plt.plot(range(1, num_epochs + 1), train_losses, label="Train Loss")
plt.plot(range(1, num_epochs + 1), test_losses, label="Test Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.title("Epoch vs. Loss")
plt.legend()
plt.grid()
plt.show()

# Print Final Accuracy
print(f"Final Training Accuracy: {train_accuracies[-1]:.4f}")
print(f"Final Testing Accuracy: {test_accuracies[-1]:.4f}")
