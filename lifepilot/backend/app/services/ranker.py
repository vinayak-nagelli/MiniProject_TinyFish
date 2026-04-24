from typing import List
from app.models.schemas import DealItem

def rank_deals(swiggy_deals: List[DealItem], zomato_deals: List[DealItem]) -> List[DealItem]:
    """
    Combines deals from multiple platforms and ranks them based on True Price.
    True Price = Price + Delivery Fee - Discount
    """
    all_deals = swiggy_deals + zomato_deals
    
    # Calculate true price for each item
    for deal in all_deals:
        deal.true_price = deal.price + deal.delivery_fee - deal.discount
        # Prevent negative prices just in case
        deal.true_price = max(0.0, deal.true_price)
        
    # Sort deals primarily by lowest true price, then by highest rating
    ranked_deals = sorted(all_deals, key=lambda x: (x.true_price, -x.rating))
    
    return ranked_deals
