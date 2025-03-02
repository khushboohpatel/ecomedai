import pandas as pd
import logging

logger = logging.getLogger(__name__)

# Ensure this constant remains consistent with data_loader.py
CARBON_FOOTPRINT_COLUMN = "Global warming potential per functional unit"

def get_carbon_footprint(db_df: pd.DataFrame, product_name: str) -> float:
    """
    Retrieve the carbon footprint for a given product from the Database DataFrame.

    Args:
        db_df (pd.DataFrame): Database DataFrame.
        product_name (str): Product name to look up.

    Returns:
        float: Carbon footprint value; 0.0 if not found or invalid.
    """
    if not product_name:
        return 0.0
    row = db_df[db_df["product_name"] == product_name]
    if row.empty:
        logger.warning(f"Product '{product_name}' not found in database")
        return 0.0
    cf_value = row.iloc[0].get(CARBON_FOOTPRINT_COLUMN, 0.0)
    return float(cf_value) if cf_value and not pd.isna(cf_value) else 0.0
