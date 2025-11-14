from openai import OpenAI
import os
import json
from fastapi import HTTPException
from backend.supabase_client import supabase
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_ai_game_recommendation(user_id: str, user_input: str = None):
    try:
        DAILY_LIMIT = 10

        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        recent_requests = supabase.table("ai_request_logs").select("id").eq("user_id", user_id).gte("created_at", yesterday).execute()

        if len(recent_requests.data) >= DAILY_LIMIT:
            raise HTTPException(
                status_code=429,
                detail=f"Daily limit reached. You can make {DAILY_LIMIT} AI requests per day. Try again tomorrow!"
            )

        supabase.table("ai_request_logs").insert({"user_id": user_id}).execute()

        tracked = supabase.table("user_games").select("*, games(name, app_id)").eq("user_id", user_id).execute()

        tracked_games = [game["games"]["name"] for game in tracked.data if game.get('games')]

        if user_input:
            prompt = f"""You are a Steam game recommendation expert.

  User's request: {user_input}

  First, analyze what the user is looking for and explain your reasoning. Then recommend 5 Steam games they would enjoy.

  Respond with ONLY valid JSON in this exact format:
  {{
    "reasoning": "Explain your understanding of what the user wants and your approach to recommendations (2-3 sentences)",
    "recommendations": [
      {{
        "title": "Game Name",
        "rationale": "Detailed explanation of why this game matches their request (2-3 sentences)"
        "genres": "Action, RPG, Open World"
      }}
    ]
  }}"""

        else:
            if not tracked_games:
                raise HTTPException(status_code=400, detail="No tracked games to analyze. Please track some games first or describe your preferences.")

            prompt = f"""You are a Steam game recommendation expert.

  User is currently tracking these games: {', '.join(tracked_games)}
  
  IMPORTANT: Do NOT recommend any of the games listed above. They are already tracking these games.

  First, analyze their gaming preferences based on the tracked games. Then recommend 5 NEW Steam games they would enjoy that are NOT in their tracked list.

  Respond with ONLY valid JSON in this exact format:
  {{
    "reasoning": "Explain what patterns you see in their tracked games and your recommendation approach (2-3 sentences)",
    "recommendations": [
      {{
        "title": "Game Name",
        "rationale": "Detailed explanation based on their tracked games (2-3 sentences)"
        "genres": "Action, RPG, Open World"
      }}
    ]
  }}"""


        response = openai_client.chat.completions.create(
            model="gpt-4.1-nano-2025-04-14",
            messages=[
                {
                    "role": "system",
                    "content": "You are a Steam game recommendation expert. Always respond with valid JSON only, no markdown or extra text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()

        recommendations = json.loads(content)

        if not user_input and tracked_games:
            tracked_games_lower = [game.lower() for game in tracked_games]

            original_count = len(recommendations.get("recommendations", []))

            filter_recs = [
                rec for rec in recommendations.get("recommendations", [])
                if rec.get("title", "").lower() not in tracked_games_lower
            ]
            recommendations["recommendations"] = filter_recs


            if len(filter_recs) < original_count:
                logger.warning(f"Filtered {original_count - len(filter_recs)} already tracked games from AI recommendations")

        logger.info(f"AI recommendations generated for {user_id} using gpt-4.1-nano")

        return {
            "reasoning": recommendations.get("reasoning", ""),
            "recommendations": recommendations.get("recommendations", []),
            "based_on_tracked_games": not bool(user_input),
            "tracked_games_count": len(tracked_games),
            "requests_remaining": DAILY_LIMIT - len(recent_requests.data) - 1
        }
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        logger.error(f"Raw content: {content}")
        raise HTTPException(status_code=500, detail="Failed to parse AI recommendations")
    except Exception as e:
        logger.error(f"Error generating AI recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))
