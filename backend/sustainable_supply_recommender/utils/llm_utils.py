from typing import List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import logging

logger = logging.getLogger(__name__)

def rerank_with_llm(bom_item: str, candidates: List[str], llm: ChatGoogleGenerativeAI) -> Dict[str, Optional[str]]:
    """
    Use an LLM to re-rank candidates for a BOM item and select the best match and equivalent items.

    Args:
        bom_item (str): BOM item to match.
        candidates (List[str]): List of candidate product names.
        llm (ChatGoogleGenerativeAI): Initialized LLM instance.

    Returns:
        Dict[str, Optional[str]]: A dictionary with keys "matched_item" and "equivalent_items".
    """
    prompt = f"""
You are provided with a list of candidate product names.
For the BOM item: "{bom_item}", identify the best matching candidate and any equivalent items.
Instructions:
1. If no candidate is a valid match, set "matched_item" to null.
2. If there are no equivalent items, set "equivalent_items" to an empty list.
Return your answer in JSON format:
{{
  "matched_item": "<best match or null>",
  "equivalent_items": ["item1", "item2", ...]
}}

Candidates:
{json.dumps(candidates, indent=2)}
"""
    try:
        response = llm.invoke(prompt)
        response_text = response.content.strip()
        # Remove potential markdown formatting
        response_text = response_text.replace('```json', '').replace('```', '')
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        cleaned_response = response_text[start:end]
        result = json.loads(cleaned_response)
        logger.info(f"LLM result for '{bom_item}': {result}")
        return result
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON from LLM for '{bom_item}': {response_text}", exc_info=True)
        return {"matched_item": None, "equivalent_items": []}
    except Exception as e:
        logger.error(f"LLM processing error for '{bom_item}': {str(e)}", exc_info=True)
        return {"matched_item": None, "equivalent_items": []}
