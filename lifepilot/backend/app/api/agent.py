from fastapi import APIRouter, HTTPException
import asyncio
from app.models.schemas import UserIntent, DealItem
from app.services.tinyfish_service import run_swiggy_agent, run_zomato_agent
from app.services.ranker import rank_deals
from typing import List

router = APIRouter()

@router.post("/run-agent", response_model=List[DealItem])
async def execute_agent(intent: UserIntent):
    try:
        tasks = []
        # If user specified platforms, ONLY run those. Otherwise, run both.
        run_swiggy = "Swiggy" in intent.preferred_platforms or not intent.preferred_platforms
        run_zomato = "Zomato" in intent.preferred_platforms or not intent.preferred_platforms
        
        if run_swiggy:
            tasks.append(run_swiggy_agent(intent))
        if run_zomato:
            tasks.append(run_zomato_agent(intent))
            
        if not tasks:
            raise ValueError("No platforms selected to run.")
            
        # Run selected agents in parallel using asyncio.gather
        results = await asyncio.gather(*tasks)
        
        # Flatten the list of lists
        all_deals = [item for sublist in results for item in sublist]
        
        # Rank the combined results
        # We pass empty lists if one is missing, or just pass the flattened list to a modified ranker
        # Assuming rank_deals handles Swiggy and Zomato lists, let's just split them back
        swiggy_deals = [d for d in all_deals if d.platform == "Swiggy"]
        zomato_deals = [d for d in all_deals if d.platform == "Zomato"]
        
        ranked_results = rank_deals(swiggy_deals, zomato_deals)
        return ranked_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
