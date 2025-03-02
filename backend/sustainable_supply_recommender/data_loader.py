from typing import Tuple
import os
import pandas as pd
import logging

logger = logging.getLogger(__name__)

CARBON_FOOTPRINT_COLUMN = "Global warming potential per functional unit"

def load_data(bom_csv_path: str, db_csv_path: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Load BOM and Database CSV files into pandas DataFrames.

    Args:
        bom_csv_path (str): Path to the BOM CSV file.
        db_csv_path (str): Path to the Database CSV file.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: The BOM and Database DataFrames.

    Raises:
        FileNotFoundError: If either CSV file does not exist.
        ValueError: If required columns are missing.
    """
    if not os.path.exists(bom_csv_path):
        logger.error(f"BOM CSV file not found: {bom_csv_path}")
        raise FileNotFoundError(f"BOM CSV file not found: {bom_csv_path}")
    if not os.path.exists(db_csv_path):
        logger.error(f"Database CSV file not found: {db_csv_path}")
        raise FileNotFoundError(f"Database CSV file not found: {db_csv_path}")

    bom_df = pd.read_csv(bom_csv_path)
    db_df = pd.read_csv(db_csv_path)

    if 'Product or process' in db_df.columns:
        db_df.rename(columns={'Product or process': 'product_name'}, inplace=True)

    if 'quantity' not in bom_df.columns:
        bom_df['quantity'] = 1.0

    # Validate required columns
    for df, name in [(bom_df, 'BOM'), (db_df, 'Database')]:
        if 'product_name' not in df.columns:
            raise ValueError(f"{name} CSV must contain 'product_name' column")
    if CARBON_FOOTPRINT_COLUMN not in db_df.columns:
        raise ValueError(f"Database CSV must contain '{CARBON_FOOTPRINT_COLUMN}' column")

    logger.info("Data loaded successfully")
    return bom_df, db_df
