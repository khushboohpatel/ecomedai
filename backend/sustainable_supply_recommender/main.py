from .data_loader import load_db_data
from .utils.vectorstore_utils import create_vectorstore
from .recommender import process_bom_items
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
import os
import json
import logging
import argparse
import uvicorn
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Globals to hold heavy initializations
global_db_df = None
global_vectorstore = None
llm = None

app = FastAPI(
    title="EcoMedAI - BOM Processing API",
    description="API to process BOM items and return carbon footprint analysis",
    version="1.0"
)

# Enable CORS for frontend app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

async def initialize_supply_resources():
    """
    Initialize heavy resources for the supply app (run during startup).
    """
    global global_db_df, global_vectorstore, llm
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        DB_CSV_PATH = os.path.join(current_dir, "data", "healthcare_lca_master_data.csv")
        global_db_df = load_db_data(DB_CSV_PATH)
        global_vectorstore, _ = create_vectorstore(global_db_df)
        llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash')
        logger.info("Supply resources initialized successfully.")
    except Exception as e:
        logger.error("Error during supply resources initialization", exc_info=True)
        raise e

@app.post("/process")
async def process_bom(bom_file: UploadFile = File(...)):
    """
    API endpoint to process a BOM CSV file uploaded by the user.
    The Database CSV is loaded from a fixed path.
    """
    if global_db_df is None or global_vectorstore is None:
        raise HTTPException(status_code=500, detail="Server initialization incomplete.")
    
    try:
        bom_contents = await bom_file.read()
    except Exception as e:
        logger.error(f"Error reading BOM file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Invalid BOM CSV file provided.")

    try:
        bom_df = pd.read_csv(BytesIO(bom_contents))
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Error processing CSV files.")

    # Validate required columns
    if 'product_name' not in bom_df.columns:
        raise HTTPException(status_code=400, detail="BOM CSV must contain 'product_name' column.")
    if 'quantity' not in bom_df.columns:
        bom_df['quantity'] = 1.0

    try:
        result_data = process_bom_items(bom_df, global_db_df, global_vectorstore, llm)
        return result_data
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during processing.")

def run_cli():
    """
    CLI mode: Simulate an upload by reading a local BOM file,
    then process it using the shared logic.
    """
    bom_file_path = os.path.join("data", "hospital_purchase_order.csv")
    try:
        with open(bom_file_path, "rb") as f:
            bom_bytes = f.read()
    except Exception as e:
        logger.error(f"Error reading BOM file: {str(e)}", exc_info=True)
        return

    try:
        bom_df = pd.read_csv(BytesIO(bom_bytes))
    except Exception as e:
        logger.error(f"Error loading CSV data: {str(e)}", exc_info=True)
        return

    # Ensure BOM has a quantity column
    if 'quantity' not in bom_df.columns:
        bom_df['quantity'] = 1.0

    try:
        result_data = process_bom_items(bom_df, global_db_df, global_vectorstore, llm)
    except Exception as e:
        logger.error(f"Error processing BOM items: {str(e)}", exc_info=True)
        return

    # Save results locally
    output_path = 'results.json'
    with open(output_path, 'w') as f:
        json.dump(result_data, f, indent=2)
    logger.info(f"Processing completed. Results saved to '{output_path}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run BOM processing in API or CLI mode.")
    parser.add_argument(
        "--mode",
        choices=["api", "cli"],
        default="api",
        help="Run mode: 'api' to launch the FastAPI server, 'cli' to execute CLI processing."
    )
    args = parser.parse_args()

    if args.mode == "cli":
        initialize_supply_resources()
        run_cli()
    else:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
