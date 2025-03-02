from data_loader import load_data, CARBON_FOOTPRINT_COLUMN
from utils.vectorstore_utils import create_vectorstore
from recommender import process_bom_items
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from io import BytesIO
import os
import json
import logging
import argparse
import uvicorn


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash')
logger.info("LLM initialized successfully")

# Define the fixed path for the Database CSV file
DB_CSV_PATH = os.path.join("data", "healthcare_lca_master_data.csv")

app = FastAPI(
    title="BOM Processing API",
    description="API to process BOM items and return carbon footprint analysis",
    version="1.0"
)

@app.post("/process")
async def process_bom(bom_file: UploadFile = File(...)):
    """
    API endpoint to process a BOM CSV file uploaded by the user.
    The Database CSV is loaded from a fixed path.
    """
    try:
        bom_contents = await bom_file.read()
    except Exception as e:
        logger.error(f"Error reading BOM file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Invalid BOM CSV file provided.")

    try:
        bom_df, db_df = load_data(BytesIO(bom_contents), DB_CSV_PATH)
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Error processing CSV files.")

    # Validate required columns
    if 'product_name' not in bom_df.columns:
        raise HTTPException(status_code=400, detail="BOM CSV must contain 'product_name' column.")
    if 'quantity' not in bom_df.columns:
        bom_df['quantity'] = 1.0
    if 'product_name' not in db_df.columns:
        raise HTTPException(status_code=400, detail="Database CSV must contain 'product_name' column.")
    if CARBON_FOOTPRINT_COLUMN not in db_df.columns:
        raise HTTPException(status_code=400, detail=f"Database CSV must contain '{CARBON_FOOTPRINT_COLUMN}' column.")

    try:
        vectorstore, _ = create_vectorstore(db_df)
        result_data = process_bom_items(bom_df, db_df, vectorstore, llm)
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
        bom_df, db_df = load_data(BytesIO(bom_bytes), DB_CSV_PATH)
    except Exception as e:
        logger.error(f"Error loading CSV data: {str(e)}", exc_info=True)
        return

    # Ensure BOM has a quantity column
    if 'quantity' not in bom_df.columns:
        bom_df['quantity'] = 1.0

    vectorstore, _ = create_vectorstore(db_df)
    result_data = process_bom_items(bom_df, db_df, vectorstore, llm)

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
        run_cli()
    else:
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
