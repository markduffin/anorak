from fastapi import APIRouter, HTTPException
import httpx

# Leave prefix empty here because main.py mounts this router with prefix="/api/mlb"
router = APIRouter()

DIVISION_ORDER = [
    "American League East",
    "American League Central",
    "American League West",
    "National League East",
    "National League Central",
    "National League West"
]

@router.get("/seasons/{year}/standings")
async def get_regular_season_standings(year: int):
    if year not in [2025, 2026]:
        raise HTTPException(
            status_code=400,
            detail="Only 2025 and 2026 regular seasons are currently supported."
        )

    upstream_url = (
        f"https://statsapi.mlb.com/api/v1/standings"
        f"?leagueId=103,104&season={year}&standingsTypes=regularSeason&hydrate=division"
    )

    async with httpx.AsyncClient() as client:
        resp = await client.get(upstream_url, timeout=10.0)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch MLB standings.")
        data = resp.json()

    divisions = []
    for rec in data.get("records", []):
        div_info = rec.get("division", {})
        div_name = div_info.get("name", "Unknown Division")
        team_records = rec.get("teamRecords", [])

        teams = []
        for team_data in team_records:
            t = team_data.get("team", {})
            splits = team_data.get("records", {}).get("splitRecords", [])
            home_rec = next((s for s in splits if s.get("type") == "home"), {})
            away_rec = next((s for s in splits if s.get("type") == "away"), {})
            last_10 = next((s for s in splits if s.get("type") == "lastTen"), {})

            teams.append({
                "id": t.get("id"),
                "name": t.get("name"),
                "divisionRank": int(team_data.get("divisionRank", 99)),
                "wins": team_data.get("wins", 0),
                "losses": team_data.get("losses", 0),
                "pct": team_data.get("winningPercentage", ".000"),
                "gamesBack": team_data.get("gamesBack", "-"),
                "runDiff": team_data.get("runDifferential", 0),
                "home": f"{home_rec.get('wins', 0)}-{home_rec.get('losses', 0)}",
                "away": f"{away_rec.get('wins', 0)}-{away_rec.get('losses', 0)}",
                "last10": f"{last_10.get('wins', 0)}-{last_10.get('losses', 0)}",
                "streak": team_data.get("streak", {}).get("streakCode", "-")
            })

        teams.sort(key=lambda x: x["divisionRank"])
        divisions.append({
            "id": div_info.get("id"),
            "name": div_name,
            "teams": teams
        })

    divisions.sort(key=lambda d: DIVISION_ORDER.index(d["name"]) if d["name"] in DIVISION_ORDER else 99)

    return {
        "season": year,
        "segment": "regular",
        "divisions": divisions
    }