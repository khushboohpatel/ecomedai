from typing import Tuple, Union, IO
import os
import pandas as pd
import logging

logger = logging.getLogger(__name__)

CARBON_FOOTPRINT_COLUMN = "Global warming potential per functional unit"

def _read_csv(source: Union[str, IO]) -> pd.DataFrame:
    """
    Helper function to read a CSV file from a file path or file-like object.
    """
    if isinstance(source, str):
        if not os.path.exists(source):
            raise FileNotFoundError(f"CSV file not found: {source}")
        return pd.read_csv(source)
    else:
        return pd.read_csv(source)

def load_data(bom_source: Union[str, IO], db_source: Union[str, IO]) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Load BOM and database CSV files into pandas DataFrames.
    
    This function accepts either file paths (str) or file-like objects (e.g. BytesIO).
    
    Args:
        bom_source (str): BOM CSV file path or file-like object.
        db_source (str): Database CSV file path or file-like object.
    
    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: The BOM and Database DataFrames.
    
    Raises:
        FileNotFoundError: If a file path does not exist.
        ValueError: If required columns are missing.
        Exception: For other errors during loading.
    """
    try:
        bom_df = _read_csv(bom_source)
        db_df = _read_csv(db_source)

        # Rename 'Product or process' to 'product_name' if present in db_df
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

    except FileNotFoundError as e:
        logger.error(str(e))
        raise
    except Exception as e:
        logger.error(f"Error loading CSV files: {str(e)}", exc_info=True)
        raise
