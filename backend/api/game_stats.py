"""
Crash Games Network - Crash Game Specific Statistics API

Provides specialized statistics for crash-type games:
- Aviator, JetX, Lucky Jet, Cricket X, Football X
- Space XY, Skyward, CrashX, Aviatrix, Pilot
- Thundercrash, Triple Cash, Big Bass Crash, 1000x Busta, Uncrossable Rush

Features:
- Crash point analysis
- Quick crash detection
- Moon/big win tracking
- Cashout optimization
- Streak analysis
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
import statistics
import math

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field


# =============================================================================
# Models
# =============================================================================

class CrashThresholds(BaseModel):
    """Configurable thresholds for crash analysis."""
    instant_crash: float = 1.10
    quick_crash: float = 1.50
    early_crash: float = 2.00
    good_round: float = 3.00
    great_round: float = 5.00
    big_win: float = 10.00
    huge_win: float = 50.00
    mega_win: float = 100.00
    moon: float = 1000.00


class CrashAnalysis(BaseModel):
    """Crash point analysis."""
    total_rounds: int
    average_crash: float
    median_crash: float
    std_deviation: float

    # Crash rates
    instant_crash_rate: float = Field(..., description="<1.10x rate (%)")
    quick_crash_rate: float = Field(..., description="<1.50x rate (%)")
    early_crash_rate: float = Field(..., description="<2.00x rate (%)")

    # Win rates
    good_round_rate: float = Field(..., description=">3x rate (%)")
    great_round_rate: float = Field(..., description=">5x rate (%)")
    big_win_rate: float = Field(..., description=">10x rate (%)")
    huge_win_rate: float = Field(..., description=">50x rate (%)")
    mega_win_rate: float = Field(..., description=">100x rate (%)")
    moon_rate: float = Field(..., description=">1000x rate (%)")

    # Records
    highest_crash: float
    lowest_crash: float
    last_moon: Optional[datetime] = None
    rounds_since_moon: Optional[int] = None


class CashoutOptimizer(BaseModel):
    """Cashout point optimization data."""
    target_multiplier: float
    win_rate: float = Field(..., description="Probability of reaching target (%)")
    expected_value: float = Field(..., description="Expected value per unit bet")
    risk_reward_ratio: float
    recommended: bool = Field(..., description="Is this target recommended?")


class QuickCrashAlert(BaseModel):
    """Quick crash alert data."""
    last_10_quick_crashes: int = Field(..., description="<1.5x in last 10 rounds")
    last_20_quick_crashes: int
    last_50_quick_crashes: int
    alert_level: str = Field(..., description="low, medium, high, critical")
    consecutive_quick_crashes: int


class MoonTracker(BaseModel):
    """Moon (1000x+) tracking data."""
    total_moons: int
    last_moon_value: Optional[float] = None
    last_moon_time: Optional[datetime] = None
    rounds_since_moon: int
    average_rounds_between_moons: Optional[float] = None
    moon_probability: float = Field(..., description="Estimated moon probability (%)")


class CrashGameStatistics(BaseModel):
    """Complete crash game statistics."""
    game: str
    period: str
    generated_at: datetime

    # Core analysis
    crash_analysis: CrashAnalysis

    # Streak info
    current_streak: Dict[str, Any]
    streak_history: Dict[str, Any]

    # Specialized data
    quick_crash_alert: QuickCrashAlert
    moon_tracker: MoonTracker

    # Cashout optimization
    cashout_targets: List[CashoutOptimizer]

    # Hourly patterns
    best_hours: List[Dict[str, Any]]
    worst_hours: List[Dict[str, Any]]


# =============================================================================
# Calculator
# =============================================================================

class CrashGameCalculator:
    """Calculates crash game specific statistics."""

    def __init__(self, thresholds: Optional[CrashThresholds] = None):
        self.thresholds = thresholds or CrashThresholds()

    def analyze_crashes(
        self,
        multipliers: List[float],
        timestamps: Optional[List[datetime]] = None,
    ) -> CrashAnalysis:
        """Analyze crash points."""
        if not multipliers:
            return CrashAnalysis(
                total_rounds=0,
                average_crash=0,
                median_crash=0,
                std_deviation=0,
                instant_crash_rate=0,
                quick_crash_rate=0,
                early_crash_rate=0,
                good_round_rate=0,
                great_round_rate=0,
                big_win_rate=0,
                huge_win_rate=0,
                mega_win_rate=0,
                moon_rate=0,
                highest_crash=0,
                lowest_crash=0,
            )

        n = len(multipliers)
        t = self.thresholds

        # Basic stats
        avg = statistics.mean(multipliers)
        med = statistics.median(multipliers)
        std = statistics.stdev(multipliers) if n > 1 else 0

        # Calculate rates
        instant = sum(1 for m in multipliers if m < t.instant_crash) / n * 100
        quick = sum(1 for m in multipliers if m < t.quick_crash) / n * 100
        early = sum(1 for m in multipliers if m < t.early_crash) / n * 100
        good = sum(1 for m in multipliers if m >= t.good_round) / n * 100
        great = sum(1 for m in multipliers if m >= t.great_round) / n * 100
        big = sum(1 for m in multipliers if m >= t.big_win) / n * 100
        huge = sum(1 for m in multipliers if m >= t.huge_win) / n * 100
        mega = sum(1 for m in multipliers if m >= t.mega_win) / n * 100
        moon = sum(1 for m in multipliers if m >= t.moon) / n * 100

        # Find last moon
        last_moon_time = None
        rounds_since = None
        if timestamps:
            for i, m in enumerate(multipliers):
                if m >= t.moon:
                    last_moon_time = timestamps[i]
                    rounds_since = i
                    break

        return CrashAnalysis(
            total_rounds=n,
            average_crash=round(avg, 4),
            median_crash=round(med, 4),
            std_deviation=round(std, 4),
            instant_crash_rate=round(instant, 2),
            quick_crash_rate=round(quick, 2),
            early_crash_rate=round(early, 2),
            good_round_rate=round(good, 2),
            great_round_rate=round(great, 2),
            big_win_rate=round(big, 2),
            huge_win_rate=round(huge, 2),
            mega_win_rate=round(mega, 2),
            moon_rate=round(moon, 4),
            highest_crash=max(multipliers),
            lowest_crash=min(multipliers),
            last_moon=last_moon_time,
            rounds_since_moon=rounds_since,
        )

    def calculate_quick_crash_alert(
        self,
        multipliers: List[float],
    ) -> QuickCrashAlert:
        """Calculate quick crash alert level."""
        t = self.thresholds

        # Count quick crashes in recent rounds
        last_10 = sum(1 for m in multipliers[:10] if m < t.quick_crash)
        last_20 = sum(1 for m in multipliers[:20] if m < t.quick_crash)
        last_50 = sum(1 for m in multipliers[:50] if m < t.quick_crash)

        # Count consecutive quick crashes
        consecutive = 0
        for m in multipliers:
            if m < t.quick_crash:
                consecutive += 1
            else:
                break

        # Determine alert level
        if consecutive >= 5 or last_10 >= 7:
            level = "critical"
        elif consecutive >= 3 or last_10 >= 5:
            level = "high"
        elif last_10 >= 4 or last_20 >= 10:
            level = "medium"
        else:
            level = "low"

        return QuickCrashAlert(
            last_10_quick_crashes=last_10,
            last_20_quick_crashes=last_20,
            last_50_quick_crashes=last_50,
            alert_level=level,
            consecutive_quick_crashes=consecutive,
        )

    def track_moons(
        self,
        multipliers: List[float],
        timestamps: Optional[List[datetime]] = None,
    ) -> MoonTracker:
        """Track moon (1000x+) occurrences."""
        t = self.thresholds

        moon_indices = [i for i, m in enumerate(multipliers) if m >= t.moon]
        total_moons = len(moon_indices)

        # Last moon info
        last_value = None
        last_time = None
        rounds_since = len(multipliers)

        if moon_indices:
            last_idx = moon_indices[0]
            last_value = multipliers[last_idx]
            rounds_since = last_idx
            if timestamps and last_idx < len(timestamps):
                last_time = timestamps[last_idx]

        # Average rounds between moons
        avg_between = None
        if len(moon_indices) > 1:
            gaps = [moon_indices[i] - moon_indices[i+1] for i in range(len(moon_indices)-1)]
            avg_between = statistics.mean(gaps)

        # Estimated probability
        probability = (total_moons / len(multipliers) * 100) if multipliers else 0

        return MoonTracker(
            total_moons=total_moons,
            last_moon_value=last_value,
            last_moon_time=last_time,
            rounds_since_moon=rounds_since,
            average_rounds_between_moons=round(avg_between, 1) if avg_between else None,
            moon_probability=round(probability, 4),
        )

    def optimize_cashout(
        self,
        multipliers: List[float],
        targets: Optional[List[float]] = None,
    ) -> List[CashoutOptimizer]:
        """Calculate optimal cashout points."""
        if not targets:
            targets = [1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 10.0, 20.0, 50.0]

        n = len(multipliers)
        if n == 0:
            return []

        results = []
        for target in targets:
            # Win rate = probability of crash >= target
            wins = sum(1 for m in multipliers if m >= target)
            win_rate = wins / n * 100

            # Expected value = (win_rate * target) - (1 - win_rate)
            # Assuming unit bet
            ev = (win_rate / 100 * target) - (1 - win_rate / 100)

            # Risk/reward ratio
            risk_reward = target / (100 / win_rate) if win_rate > 0 else 0

            # Recommendation (EV > 0.9 and win_rate reasonable)
            recommended = ev > 0.9 and win_rate >= 30

            results.append(CashoutOptimizer(
                target_multiplier=target,
                win_rate=round(win_rate, 2),
                expected_value=round(ev, 4),
                risk_reward_ratio=round(risk_reward, 4),
                recommended=recommended,
            ))

        return results

    def analyze_hourly_patterns(
        self,
        rounds: List[Tuple[float, datetime]],
    ) -> Tuple[List[Dict], List[Dict]]:
        """Find best and worst hours."""
        hourly: Dict[int, List[float]] = {h: [] for h in range(24)}

        for multiplier, timestamp in rounds:
            hourly[timestamp.hour].append(multiplier)

        # Calculate averages
        hourly_stats = []
        for hour in range(24):
            if hourly[hour]:
                avg = statistics.mean(hourly[hour])
                big_win_rate = sum(1 for m in hourly[hour] if m >= 10) / len(hourly[hour]) * 100
                hourly_stats.append({
                    "hour": hour,
                    "average": round(avg, 4),
                    "rounds": len(hourly[hour]),
                    "big_win_rate": round(big_win_rate, 2),
                })

        # Sort for best/worst
        sorted_stats = sorted(hourly_stats, key=lambda x: x["average"], reverse=True)

        best = sorted_stats[:3] if len(sorted_stats) >= 3 else sorted_stats
        worst = sorted_stats[-3:][::-1] if len(sorted_stats) >= 3 else []

        return best, worst

    def calculate_streaks(
        self,
        multipliers: List[float],
        threshold: float = 2.0,
    ) -> Tuple[Dict, Dict]:
        """Calculate current and historical streaks."""
        # Current streak
        current_type = "below" if multipliers and multipliers[0] < threshold else "above"
        current_count = 0
        for m in multipliers:
            if (current_type == "below" and m < threshold) or \
               (current_type == "above" and m >= threshold):
                current_count += 1
            else:
                break

        # Historical streaks
        below_streaks = []
        above_streaks = []
        current_below = 0
        current_above = 0

        for m in multipliers:
            if m < threshold:
                current_below += 1
                if current_above > 0:
                    above_streaks.append(current_above)
                    current_above = 0
            else:
                current_above += 1
                if current_below > 0:
                    below_streaks.append(current_below)
                    current_below = 0

        current_streak = {
            "type": current_type,
            "count": current_count,
            "threshold": threshold,
        }

        streak_history = {
            "below": {
                "max": max(below_streaks) if below_streaks else 0,
                "average": round(statistics.mean(below_streaks), 2) if below_streaks else 0,
                "total": len(below_streaks),
            },
            "above": {
                "max": max(above_streaks) if above_streaks else 0,
                "average": round(statistics.mean(above_streaks), 2) if above_streaks else 0,
                "total": len(above_streaks),
            },
        }

        return current_streak, streak_history


# =============================================================================
# Service
# =============================================================================

class CrashGameStatsService:
    """Service for crash game statistics."""

    def __init__(self, db_pool, game: str):
        self.db_pool = db_pool
        self.game = game
        self.calculator = CrashGameCalculator()

    async def get_rounds(
        self,
        hours: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> List[Tuple[float, datetime]]:
        """Fetch rounds from database."""
        query = "SELECT crash_multiplier, created_at FROM rounds"
        params = []

        if hours:
            cutoff = datetime.utcnow() - timedelta(hours=hours)
            query += " WHERE created_at >= ?"
            params.append(cutoff)

        query += " ORDER BY created_at DESC"

        if limit:
            query += f" LIMIT {limit}"

        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [(float(row['crash_multiplier']), row['created_at']) for row in rows]

    async def get_statistics(
        self,
        period: str = "24h",
    ) -> CrashGameStatistics:
        """Get complete crash game statistics."""
        # Parse period
        hours_map = {"1h": 1, "6h": 6, "24h": 24, "7d": 168, "30d": 720}
        hours = hours_map.get(period, 24)

        # Fetch data
        rounds = await self.get_rounds(hours=hours)
        multipliers = [r[0] for r in rounds]
        timestamps = [r[1] for r in rounds]

        # Calculate all stats
        crash_analysis = self.calculator.analyze_crashes(multipliers, timestamps)
        quick_alert = self.calculator.calculate_quick_crash_alert(multipliers)
        moon_tracker = self.calculator.track_moons(multipliers, timestamps)
        cashout_targets = self.calculator.optimize_cashout(multipliers)
        current_streak, streak_history = self.calculator.calculate_streaks(multipliers)
        best_hours, worst_hours = self.calculator.analyze_hourly_patterns(rounds)

        return CrashGameStatistics(
            game=self.game,
            period=period,
            generated_at=datetime.utcnow(),
            crash_analysis=crash_analysis,
            current_streak=current_streak,
            streak_history=streak_history,
            quick_crash_alert=quick_alert,
            moon_tracker=moon_tracker,
            cashout_targets=cashout_targets,
            best_hours=best_hours,
            worst_hours=worst_hours,
        )


# =============================================================================
# Router Factory
# =============================================================================

def create_crash_game_router(db_pool, game: str) -> APIRouter:
    """Create router for crash game statistics."""
    router = APIRouter(prefix="/api/v2/crash", tags=["crash-stats"])
    service = CrashGameStatsService(db_pool, game)

    @router.get(
        "/{game_name}",
        response_model=CrashGameStatistics,
        summary="Get Crash Game Statistics",
    )
    async def get_crash_stats(
        game_name: str,
        period: str = Query("24h", regex="^(1h|6h|24h|7d|30d)$"),
    ):
        if game_name != game:
            raise HTTPException(status_code=404, detail="Game not found")
        return await service.get_statistics(period)

    @router.get(
        "/{game_name}/quick-crash-alert",
        response_model=QuickCrashAlert,
        summary="Get Quick Crash Alert",
    )
    async def get_quick_crash_alert(game_name: str):
        if game_name != game:
            raise HTTPException(status_code=404, detail="Game not found")
        rounds = await service.get_rounds(limit=50)
        multipliers = [r[0] for r in rounds]
        return service.calculator.calculate_quick_crash_alert(multipliers)

    @router.get(
        "/{game_name}/moon-tracker",
        response_model=MoonTracker,
        summary="Get Moon Tracker",
    )
    async def get_moon_tracker(
        game_name: str,
        period: str = Query("7d"),
    ):
        if game_name != game:
            raise HTTPException(status_code=404, detail="Game not found")
        hours_map = {"1h": 1, "6h": 6, "24h": 24, "7d": 168, "30d": 720}
        hours = hours_map.get(period, 168)
        rounds = await service.get_rounds(hours=hours)
        multipliers = [r[0] for r in rounds]
        timestamps = [r[1] for r in rounds]
        return service.calculator.track_moons(multipliers, timestamps)

    @router.get(
        "/{game_name}/cashout-optimizer",
        response_model=List[CashoutOptimizer],
        summary="Get Cashout Optimization",
    )
    async def get_cashout_optimizer(
        game_name: str,
        period: str = Query("7d"),
    ):
        if game_name != game:
            raise HTTPException(status_code=404, detail="Game not found")
        hours_map = {"1h": 1, "6h": 6, "24h": 24, "7d": 168, "30d": 720}
        hours = hours_map.get(period, 168)
        rounds = await service.get_rounds(hours=hours)
        multipliers = [r[0] for r in rounds]
        return service.calculator.optimize_cashout(multipliers)

    return router


# List of crash games
CRASH_GAMES = [
    "aviator", "jetx", "luckyjet", "cricketx", "footballx",
    "spacexy", "skyward", "crashx", "aviatrix", "pilot",
    "thundercrash", "triplecash", "bigbasscrash", "1000xbusta",
    "uncrossablerush"
]
