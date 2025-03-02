# EcoMedAI - Sustainable Supply Recommender

## Overview:
This repository provides a BOM (Bill of Materials) processing pipeline that matches BOM items against a product database to calculate carbon footprint and suggest sustainable alternatives using a combination of FAISS vector store and a Language Learning Model (LLM).

## Features:
- CSV Data Loading: Load and validate BOM CSV file.
- Vector Store Creation: Build a vector store using HuggingFace embeddings and FAISS.
- LLM-based Matching: Re-rank similar products using ChatGoogleGenerativeAI.
- Carbon Footprint Calculation: Compute carbon footprint for matched BOM items.
- Sustainability Suggestions: Identify and rank sustainable alternatives.


## Setup & Installation

### **1️. Clone the Repository**
```bash
git clone https://github.com/the-sniper/ecomedai.git
cd ecomedai
```

### **2️. Create a Virtual Environment (Optional but Recommended)**
It is recommended to use a Python virtual environment to manage dependencies.

On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

On Unix or macOS:
```bash
python -m venv venv
source venv/bin/activate
```

### **3️. Install Dependencies**
```bash
pip install fastapi uvicorn pandas python-dotenv langchain_huggingface langchain_community langchain_google_genai faiss faiss-gpu faiss-cpu
```

### **4. Set Up Environment Variables**

Create a .env file in the root directory and add any necessary environment variables. For example:
```bash
GOOGLE_API_KEY=your_api_key_here
```

### **5. Running the Application**
The application can run in two modes: API mode (using FastAPI) and CLI mode (command-line processing).

#### API Mode:
---------
To launch the FastAPI server, run:
```bash
python main.py --mode api
```

This starts the API server at http://0.0.0.0:8000. Use the /process endpoint to upload a BOM CSV file (via Postman, curl, or a custom UI).

#### CLI Mode:
---------
To simulate an upload using a local BOM file and process it via CLI, run:
```bash
python main.py --mode cli
```
In CLI mode, the BOM CSV file is read from the data folder (e.g. hospital_purchase_order.csv), processed together with the fixed database CSV file, and the results are saved to results.json.

### Additional Notes:
- Database CSV: The database CSV file must be located in the data folder with the name healthcare_lca_master_data.csv.
- BOM CSV: For API mode, the BOM CSV is uploaded via the API endpoint; for CLI mode, a sample BOM CSV (hospital_purchase_order.csv) is used.
- LLM Integration: The pipeline uses ChatGoogleGenerativeAI from langchain_google_genai. Ensure you have the appropriate API keys or credentials set in your .env file if needed.
- Virtual Environment: The virtual environment folder (e.g. venv/) should be added to your .gitignore to avoid committing it to version control.

### License
This project is under the **MIT License**.

