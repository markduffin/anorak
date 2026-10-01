import httpx
from fastapi import APIRouter, HTTPException, Query

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
    if year < 1995 or year > 2026:
        raise HTTPException(
            status_code=400,
            detail="Seasons are supported from 1995 through 2026."
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


@router.get("/seasons/{year}/teams/{team_id}")
async def get_team_season_profile(
    year: int,
    team_id: int,
    segment: str = Query("regular", pattern="^(regular|postseason)$")
):
    if year < 1995 or year > 2026:
        raise HTTPException(status_code=400, detail="Seasons are supported from 1995 through 2026.")

    game_type = "R" if segment == "regular" else "P"

    team_url = f"https://statsapi.mlb.com/api/v1/teams/{team_id}"
    standings_url = (
        f"https://statsapi.mlb.com/api/v1/standings"
        f"?leagueId=103,104&season={year}&standingsTypes=regularSeason"
    )
    # Correct hydration to fetch individual player stint statistics through the full-season roster feed
    roster_url = (
        f"https://statsapi.mlb.com/api/v1/teams/{team_id}/roster"
        f"?season={year}&rosterType=fullSeason"
        f"&hydrate=person(stats(group=[hitting,pitching,fielding],type=[season],season={year},gameType={game_type}))"
    )

    async with httpx.AsyncClient() as client:
        team_resp = await client.get(team_url, timeout=10.0)
        standings_resp = await client.get(standings_url, timeout=10.0)
        roster_resp = await client.get(roster_url, timeout=15.0)

    if team_resp.status_code != 200:
        raise HTTPException(status_code=404, detail="MLB team not found.")

    team_data = team_resp.json().get("teams", [{}])[0]
    division_id = team_data.get("division", {}).get("id")

    division_teams = []
    division_name = "Division"
    team_record = {"wins": 0, "losses": 0, "pct": ".000", "gamesBack": "-", "divisionRank": 99}

    if standings_resp.status_code == 200:
        for rec in standings_resp.json().get("records", []):
            if rec.get("division", {}).get("id") == division_id:
                division_name = rec.get("division", {}).get("name", "Division")
                for tr in rec.get("teamRecords", []):
                    t = tr.get("team", {})
                    entry = {
                        "id": t.get("id"),
                        "name": t.get("name"),
                        "divisionRank": int(tr.get("divisionRank", 99)),
                        "wins": tr.get("wins", 0),
                        "losses": tr.get("losses", 0),
                        "pct": tr.get("winningPercentage", ".000"),
                        "gamesBack": tr.get("gamesBack", "-")
                    }
                    division_teams.append(entry)
                    if t.get("id") == team_id:
                        team_record = entry
                break

    division_teams.sort(key=lambda x: x["divisionRank"])

    pitchers = []
    position_players = []

    if roster_resp.status_code == 200:
        roster_members = roster_resp.json().get("roster", [])

        for member in roster_members:
            person = member.get("person", {})
            player_id = person.get("id")
            player_name = person.get("fullName")
            if not player_id or not player_name:
                continue

            position = member.get("position", {}).get("abbreviation", "-")
            stats_blocks = person.get("stats", [])

            hitting_stat = None
            pitching_stat = None
            fielding_stat = None

            for sb in stats_blocks:
                group_name = sb.get("group", {}).get("displayName")
                splits = sb.get("splits", [])
                if not splits:
                    continue
                st = splits[0].get("stat", {})
                if group_name == "hitting":
                    hitting_stat = st
                elif group_name == "pitching":
                    pitching_stat = st
                elif group_name == "fielding":
                    fielding_stat = st

            # Filter & parse Pitchers
            if pitching_stat and (pitching_stat.get("gamesPitched", 0) > 0 or float(pitching_stat.get("inningsPitched", 0) or 0) > 0):
                pitchers.append({
                    "id": player_id,
                    "name": player_name,
                    "position": position if position != "-" else "P",
                    "w": pitching_stat.get("wins", 0),
                    "l": pitching_stat.get("losses", 0),
                    "era": pitching_stat.get("era", "-.--"),
                    "g": pitching_stat.get("gamesPitched", 0),
                    "gs": pitching_stat.get("gamesStarted", 0),
                    "sv": pitching_stat.get("saves", 0),
                    "ip": pitching_stat.get("inningsPitched", "0.0"),
                    "h": pitching_stat.get("hits", 0),
                    "r": pitching_stat.get("runs", 0),
                    "er": pitching_stat.get("earnedRuns", 0),
                    "bb": pitching_stat.get("baseOnBalls", 0),
                    "so": pitching_stat.get("strikeOuts", 0),
                    "whip": pitching_stat.get("whip", "-.--")
                })

            # Filter & parse Position Players
            if hitting_stat and (hitting_stat.get("gamesPlayed", 0) > 0 or hitting_stat.get("atBats", 0) > 0 or position != "P"):
                f_games = fielding_stat.get("games", 0) if fielding_stat else 0
                f_po = fielding_stat.get("putOuts", 0) if fielding_stat else 0
                f_a = fielding_stat.get("assists", 0) if fielding_stat else 0
                f_e = fielding_stat.get("errors", 0) if fielding_stat else 0
                f_fld = fielding_stat.get("fielding", ".000") if fielding_stat else ".000"

                position_players.append({
                    "id": player_id,
                    "name": player_name,
                    "position": position,
                    "hitting": {
                        "g": hitting_stat.get("gamesPlayed", 0),
                        "ab": hitting_stat.get("atBats", 0),
                        "r": hitting_stat.get("runs", 0),
                        "h": hitting_stat.get("hits", 0),
                        "doubles": hitting_stat.get("doubles", 0),
                        "triples": hitting_stat.get("triples", 0),
                        "hr": hitting_stat.get("homeRuns", 0),
                        "rbi": hitting_stat.get("rbi", 0),
                        "bb": hitting_stat.get("baseOnBalls", 0),
                        "so": hitting_stat.get("strikeOuts", 0),
                        "sb": hitting_stat.get("stolenBases", 0),
                        "avg": hitting_stat.get("avg", ".000"),
                        "obp": hitting_stat.get("obp", ".000"),
                        "slg": hitting_stat.get("slg", ".000"),
                        "ops": hitting_stat.get("ops", ".000")
                    },
                    "fielding": {
                        "games": f_games,
                        "putOuts": f_po,
                        "assists": f_a,
                        "errors": f_e,
                        "fielding": f_fld
                    }
                })

    position_players.sort(key=lambda x: x["hitting"]["ab"], reverse=True)
    pitchers.sort(
        key=lambda x: float(x["ip"]) if str(x["ip"]).replace(".", "", 1).isdigit() else 0.0,
        reverse=True
    )

    return {
        "season": year,
        "segment": segment,
        "team": {
            "id": team_data.get("id"),
            "name": team_data.get("name"),
            "abbreviation": team_data.get("abbreviation"),
            "division": division_name,
            "record": team_record,
            "logoUrl": f"https://www.mlbstatic.com/team-logos/{team_id}.svg"
        },
        "divisionTeams": division_teams,
        "pitchers": pitchers,
        "positionPlayers": position_players
    }