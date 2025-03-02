from .utils.vectorstore_utils import query_similar_items
from .utils.llm_utils import rerank_with_llm
from .utils.carbon_utils import get_carbon_footprint
from typing import Dict
import logging
import pandas as pd

logger = logging.getLogger(__name__)

def process_bom_items(bom_df: pd.DataFrame, db_df: pd.DataFrame, vectorstore, llm) -> Dict:
    """
    Process BOM items by matching them against the vectorstore and suggesting sustainable alternatives.

    Args:
        bom_df (pd.DataFrame): BOM DataFrame with product names, quantities, and unit prices.
        db_df (pd.DataFrame): Database DataFrame with product names and carbon footprint values.
        vectorstore: Pre-built FAISS vector store.
        llm: Initialized LLM instance.

    Returns:
        Dict: A dictionary with:
            - "items": List of processed item dictionaries.
            - "totalCarbonFootprint": Sum of carbon footprints for matched items.
    """
    items = []
    total_cf = 0.0

    for _, row in bom_df.iterrows():
        bomItem = row["product_name"]
        quantity = row.get("quantity", 1)
        unit_price = row.get("unit_price", 0.0)
        total_price = quantity * unit_price

        logger.info(f"Processing BOM item: {bomItem}")

        try:
            candidates = query_similar_items(vectorstore, bomItem)
            llm_result = rerank_with_llm(bomItem, candidates, llm)
            matched_item = llm_result.get("matched_item")
            equivalent_items = llm_result.get("equivalent_items", [])

            # Compute alternative items based on carbon footprint criteria
            alternate_items = []
            if matched_item and equivalent_items:
                matched_cf = get_carbon_footprint(db_df, matched_item)
                for alt in set(equivalent_items):
                    if alt != matched_item:
                        alt_cf = get_carbon_footprint(db_df, alt)
                        if 0 < alt_cf < matched_cf:
                            total_alt_cf = alt_cf * quantity
                            alternate_items.append({
                                "name": alt,
                                "carbonFootprint": alt_cf,
                                "totalAlternateCarbonFootprint": total_alt_cf
                            })
                alternate_items.sort(key=lambda x: x["carbonFootprint"])

            matched_cf = get_carbon_footprint(db_df, matched_item) if matched_item else 0.0
            total_matched_cf_units = matched_cf * quantity if matched_item else 0.0
            total_cf += total_matched_cf_units

            items.append({
                "bomItem": bomItem,
                "matchedItem": matched_item,
                "matchedItemCarbonFootprint": matched_cf,
                "totalMatchedItemCarbonFootprint": total_matched_cf_units,
                "quantity": quantity,
                "unitPrice": unit_price,
                "totalPrice": total_price,
                "alternativeItems": alternate_items
            })

        except Exception as e:
            logger.error(f"Error processing BOM item '{bomItem}': {str(e)}", exc_info=True)
            items.append({
                "bomItem": bomItem,
                "matchedItem": None,
                "matchedItemCarbonFootprint": 0.0,
                "totalMatchedItemCarbonFootprint": 0.0,
                "quantity": quantity,
                "unitPrice": unit_price,
                "totalPrice": total_price,
                "alternativeItems": []
            })

    return {
        "items": items,
        "totalCarbonFootprint": total_cf
    }
