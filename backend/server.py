from fastapi import FastAPI
from medical_trash_classifier.app import app as medical_trash_app
from sustainable_supply_recommender.main import app as supply_app, initialize_supply_resources
import logging
import uvicorn

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a parent FastAPI app
app = FastAPI(
    title="EcoMedAI - API",
    description="navigate to '/medical/docs' for Medical Trash Classifier and  '/supply/docs' Sustainable Supply Recommender",
    version="1.0"
)


@app.on_event("startup")
async def startup_event():
    await initialize_supply_resources()
    logger.info("Combined startup initialization complete.")

app.mount("/medical", medical_trash_app)
app.mount("/supply", supply_app)

if __name__ == "__main__":

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
