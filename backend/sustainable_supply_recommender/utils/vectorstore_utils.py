from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from typing import List, Tuple
import logging
import pandas as pd


logger = logging.getLogger(__name__)

def create_vectorstore(db_df: pd.DataFrame, embedding_model_name: str = "all-MiniLM-L6-v2") -> Tuple[FAISS, HuggingFaceEmbeddings]:
    """
    Create a FAISS vector store from the Database DataFrame using HuggingFace embeddings.

    Args:
        db_df (pd.DataFrame): Database DataFrame with product names.
        embedding_model_name (str): HuggingFace embedding model name.

    Returns:
        Tuple[FAISS, HuggingFaceEmbeddings]: The vector store and embedding model.
    """
    embeddings = HuggingFaceEmbeddings(model_name=embedding_model_name)
    texts = db_df["product_name"].tolist()
    vectorstore = FAISS.from_texts(texts, embeddings)
    logger.info(f"Vector store created with {len(texts)} items")
    return vectorstore, embeddings

def query_similar_items(vectorstore: FAISS, bom_item: str, top_k: int = 5) -> List[str]:
    """
    Query the vector store to find top-k similar product names for a given BOM item.

    Args:
        vectorstore (FAISS): Pre-built FAISS vector store.
        bom_item (str): BOM item to search.
        top_k (int): Number of similar items to retrieve.

    Returns:
        List[str]: List of candidate product names.
    """
    similar_docs = vectorstore.similarity_search(bom_item, k=top_k)
    candidates = [doc.page_content for doc in similar_docs]
    logger.info(f"Found {len(candidates)} similar items for '{bom_item}'")
    return candidates
