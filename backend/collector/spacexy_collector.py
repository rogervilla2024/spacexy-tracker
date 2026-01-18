"""
Space XY Data Collector

Collects crash multiplier data from BGaming Space XY demo.
Uses Playwright for browser automation and WebSocket interception.

This module provides:
- WebSocket message interception for real-time data collection
- Database persistence for collected rounds
- Test data generation for development

Note: This is a template collector. The actual implementation
depends on BGaming's demo game structure and WebSocket/API endpoints.

Author: Crash Games Team
Version: 1.0.0
"""

import asyncio
import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import aiosqlite
from playwright.async_api import async_playwright, Page, WebSocket


# =============================================================================
# Logging Configuration
# =============================================================================

def setup_logger(name: str) -> logging.Logger:
    """
    Configure and return a logger with structured JSON formatting.

    Args:
        name: The name of the logger (typically __name__).

    Returns:
        logging.Logger: Configured logger instance with JSON output.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", '
            '"logger": "%(name)s", "module": "%(module)s", '
            '"function": "%(funcName)s", "line": %(lineno)d, '
            '"message": "%(message)s"}'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


logger = setup_logger(__name__)


# =============================================================================
# Configuration
# =============================================================================

DATABASE_PATH: str = os.getenv("DATABASE_PATH", "spacexy.db")

# Known field names for multiplier extraction from various message formats
MULTIPLIER_FIELDS: List[str] = [
    'multiplier', 'crash', 'crashedAt', 'result', 'payout',
    'crashMultiplier', 'odds', 'coefficient', 'crashPoint', 'x'
]

# Known field names for round ID extraction
ROUND_ID_FIELDS: List[str] = [
    'roundId', 'gameId', 'id', 'round', 'roundNumber',
    'gameNumber', 'sessionId', 'round_id'
]

# Message types that indicate a round has ended
END_MESSAGE_TYPES: List[str] = [
    'round_result', 'crash', 'finish', 'end', 'game_over',
    'round_end', 'busted', 'crashed', 'land'
]


# =============================================================================
# Custom Exceptions
# =============================================================================

class CollectorError(Exception):
    """Base exception for collector errors."""
    pass


class DatabaseError(CollectorError):
    """Raised when database operations fail."""
    pass


class ConnectionError(CollectorError):
    """Raised when connection to data source fails."""
    pass


class ParseError(CollectorError):
    """Raised when message parsing fails."""
    pass


# =============================================================================
# Space XY Collector Class
# =============================================================================

class SpaceXYCollector:
    """
    Collects crash game data from BGaming Space XY using Playwright.

    This collector uses browser automation to intercept WebSocket messages
    and extract crash multiplier data in real-time.

    Attributes:
        db_path: Path to the SQLite database file.
        running: Flag indicating if collection is active.
        rounds_collected: Counter of successfully collected rounds.
        max_retries: Maximum number of retry attempts for failed operations.
        retry_delay: Base delay between retries in seconds.

    Example:
        collector = SpaceXYCollector()
        await collector.run(demo_url="https://demo.bgaming.com/spacexy")
    """

    def __init__(
        self,
        db_path: Optional[str] = None,
        max_retries: int = 5,
        retry_delay: float = 2.0
    ) -> None:
        """
        Initialize the Space XY collector.

        Args:
            db_path: Path to SQLite database. Defaults to DATABASE_PATH env var.
            max_retries: Maximum retry attempts for failed operations.
            retry_delay: Base delay between retries in seconds.
        """
        self.db_path: str = db_path or DATABASE_PATH
        self.running: bool = False
        self.rounds_collected: int = 0
        self.max_retries: int = max_retries
        self.retry_delay: float = retry_delay

        logger.info(f"SpaceXYCollector initialized with db_path={self.db_path}")

    async def init_db(self) -> None:
        """
        Initialize the database schema.

        Creates the spacexy_rounds table if it doesn't exist.

        Raises:
            DatabaseError: If database initialization fails.
        """
        logger.info("Initializing database...")

        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("""
                    CREATE TABLE IF NOT EXISTS spacexy_rounds (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        round_id TEXT UNIQUE NOT NULL,
                        crash_multiplier REAL NOT NULL,
                        coordinate_x REAL,
                        coordinate_y REAL,
                        hash TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await db.execute(
                    "CREATE INDEX IF NOT EXISTS idx_created ON spacexy_rounds(created_at DESC)"
                )
                await db.execute(
                    "CREATE INDEX IF NOT EXISTS idx_multiplier ON spacexy_rounds(crash_multiplier)"
                )
                await db.commit()
                logger.info("Database initialized successfully")
        except aiosqlite.Error as e:
            logger.error(f"Database initialization failed: {e}", exc_info=True)
            raise DatabaseError(f"Failed to initialize database: {e}") from e

    async def save_round(
        self,
        round_id: str,
        multiplier: float,
        coordinate_x: Optional[float] = None,
        coordinate_y: Optional[float] = None,
        hash_value: Optional[str] = None
    ) -> bool:
        """
        Save a game round to the database.

        Args:
            round_id: Unique identifier for the round.
            multiplier: Crash multiplier value (must be > 0).
            coordinate_x: Optional X coordinate for Space XY trajectory.
            coordinate_y: Optional Y coordinate for Space XY trajectory.
            hash_value: Optional provably fair hash.

        Returns:
            bool: True if round was saved successfully, False otherwise.

        Raises:
            ValueError: If multiplier is not positive.
        """
        # Validate multiplier
        if multiplier <= 0:
            logger.error(f"Invalid multiplier value: {multiplier} (must be > 0)")
            raise ValueError(f"Multiplier must be positive, got {multiplier}")

        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    """INSERT OR IGNORE INTO spacexy_rounds
                       (round_id, crash_multiplier, coordinate_x, coordinate_y, hash)
                       VALUES (?, ?, ?, ?, ?)""",
                    (round_id, multiplier, coordinate_x, coordinate_y, hash_value)
                )
                await db.commit()
                self.rounds_collected += 1

                coord_str = f" (X:{coordinate_x:.1f}, Y:{coordinate_y:.1f})" if coordinate_x and coordinate_y else ""
                logger.info(
                    f"Round saved: round_id={round_id}, multiplier={multiplier:.2f}x{coord_str}, "
                    f"total_collected={self.rounds_collected}"
                )
                return True
        except aiosqlite.IntegrityError:
            logger.debug(f"Round {round_id} already exists (duplicate)")
            return False
        except aiosqlite.Error as e:
            logger.error(f"Failed to save round {round_id}: {e}", exc_info=True)
            return False

    async def collect_with_playwright(self, demo_url: str) -> None:
        """
        Collect data using Playwright browser automation.

        Intercepts WebSocket messages from the game to extract crash data.
        Implements exponential backoff for reconnection attempts.

        Args:
            demo_url: URL of the demo game to collect data from.

        Raises:
            ConnectionError: If unable to connect after max retries.
        """
        logger.info(f"Starting Playwright collection from {demo_url}")

        retry_count: int = 0

        while self.running and retry_count < self.max_retries:
            try:
                async with async_playwright() as p:
                    browser = await p.chromium.launch(headless=True)
                    context = await browser.new_context(
                        viewport={"width": 1920, "height": 1080},
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    )
                    page = await context.new_page()

                    # Set up WebSocket message handler
                    page.on("websocket", lambda ws: self._setup_websocket_handler(ws))

                    try:
                        await page.goto(demo_url, wait_until="networkidle", timeout=60000)
                        logger.info("Page loaded successfully, monitoring for rounds...")

                        # Reset retry count on successful connection
                        retry_count = 0

                        # Keep collecting while running
                        while self.running:
                            await asyncio.sleep(1)

                    except Exception as e:
                        logger.error(f"Page navigation error: {e}", exc_info=True)
                        raise

                    finally:
                        await browser.close()
                        logger.info("Browser closed")

            except Exception as e:
                retry_count += 1
                wait_time = self.retry_delay * (2 ** (retry_count - 1))  # Exponential backoff

                logger.warning(
                    f"Collection failed (attempt {retry_count}/{self.max_retries}): {e}. "
                    f"Retrying in {wait_time:.1f}s..."
                )

                if retry_count < self.max_retries:
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Max retries ({self.max_retries}) exceeded. Stopping collection.")
                    raise ConnectionError(
                        f"Failed to connect after {self.max_retries} attempts"
                    ) from e

    def _setup_websocket_handler(self, ws: WebSocket) -> None:
        """
        Set up handlers for WebSocket message events.

        Args:
            ws: Playwright WebSocket object.
        """
        logger.info(f"WebSocket connected: {ws.url}")

        def on_message(payload: str) -> None:
            """Handle incoming WebSocket message."""
            try:
                self._process_websocket_message(payload)
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}", exc_info=True)

        ws.on("framereceived", lambda payload: on_message(payload))
        ws.on("close", lambda: logger.info(f"WebSocket closed: {ws.url}"))

    def _process_websocket_message(self, message: str) -> None:
        """
        Process a raw WebSocket message.

        Args:
            message: Raw WebSocket message string.
        """
        try:
            data = json.loads(message) if isinstance(message, str) else message
            self.parse_ws_message(data)
        except json.JSONDecodeError as e:
            logger.debug(f"Non-JSON message received: {message[:100]}...")
        except Exception as e:
            logger.error(f"Failed to process message: {e}", exc_info=True)

    def parse_ws_message(self, data: Union[Dict[str, Any], List, Any]) -> None:
        """
        Parse WebSocket message to extract crash multiplier data.

        This method attempts to extract round ID and multiplier from
        various possible message formats used by different game providers.

        Args:
            data: Parsed WebSocket message (dict, list, or other).

        Note:
            The actual message format depends on BGaming's API structure.
            This implementation handles common patterns found in crash games.
        """
        if not isinstance(data, dict):
            logger.debug(f"Skipping non-dict message: {type(data)}")
            return

        # Check if this is a round-end message
        msg_type = self._extract_message_type(data)
        if msg_type and msg_type.lower() not in END_MESSAGE_TYPES:
            logger.debug(f"Skipping non-end message type: {msg_type}")
            return

        # Extract multiplier
        multiplier = self._extract_multiplier(data)
        if multiplier is None:
            logger.debug("No multiplier found in message")
            return

        # Validate multiplier
        if multiplier <= 0:
            logger.warning(f"Invalid multiplier value: {multiplier}")
            return

        # Extract round ID
        round_id = self._extract_round_id(data)
        if round_id is None:
            # Generate a round ID if not found
            round_id = f"spacexy_{datetime.now().timestamp()}"
            logger.debug(f"Generated round_id: {round_id}")

        # Extract Space XY specific data
        coordinate_x = self._extract_coordinate_x(data)
        coordinate_y = self._extract_coordinate_y(data)
        hash_value = data.get("hash")

        # Save the round asynchronously
        asyncio.create_task(
            self.save_round(
                str(round_id),
                float(multiplier),
                coordinate_x,
                coordinate_y,
                hash_value
            )
        )

    def _extract_message_type(self, data: Dict[str, Any]) -> Optional[str]:
        """
        Extract message type from data dictionary.

        Args:
            data: Message data dictionary.

        Returns:
            Optional[str]: Message type if found, None otherwise.
        """
        for field in ['type', 't', 'action', 'event', 'messageType', 'cmd']:
            if field in data:
                return str(data[field])
        return None

    def _extract_multiplier(self, data: Dict[str, Any]) -> Optional[float]:
        """
        Extract multiplier value from data dictionary.

        Args:
            data: Message data dictionary.

        Returns:
            Optional[float]: Multiplier value if found and valid, None otherwise.
        """
        for field in MULTIPLIER_FIELDS:
            if field in data:
                try:
                    value = data[field]
                    if isinstance(value, (int, float)):
                        return float(value)
                    elif isinstance(value, str):
                        return float(value)
                except (ValueError, TypeError) as e:
                    logger.debug(f"Failed to convert {field}={data[field]} to float: {e}")
                    continue

        # Check nested structures
        if 'result' in data and isinstance(data['result'], dict):
            return self._extract_multiplier(data['result'])

        if 'data' in data and isinstance(data['data'], dict):
            return self._extract_multiplier(data['data'])

        return None

    def _extract_round_id(self, data: Dict[str, Any]) -> Optional[str]:
        """
        Extract round ID from data dictionary.

        Args:
            data: Message data dictionary.

        Returns:
            Optional[str]: Round ID if found, None otherwise.
        """
        for field in ROUND_ID_FIELDS:
            if field in data:
                return str(data[field])

        # Check nested structures
        if 'result' in data and isinstance(data['result'], dict):
            return self._extract_round_id(data['result'])

        if 'data' in data and isinstance(data['data'], dict):
            return self._extract_round_id(data['data'])

        return None

    def _extract_coordinate_x(self, data: Dict[str, Any]) -> Optional[float]:
        """
        Extract X coordinate from data dictionary.

        Args:
            data: Message data dictionary.

        Returns:
            Optional[float]: X coordinate if found, None otherwise.
        """
        for field in ['coordinateX', 'x_coord', 'coord_x']:
            if field in data:
                try:
                    return float(data[field])
                except (ValueError, TypeError):
                    continue
        return None

    def _extract_coordinate_y(self, data: Dict[str, Any]) -> Optional[float]:
        """
        Extract Y coordinate from data dictionary.

        Args:
            data: Message data dictionary.

        Returns:
            Optional[float]: Y coordinate if found, None otherwise.
        """
        for field in ['coordinateY', 'y_coord', 'coord_y']:
            if field in data:
                try:
                    return float(data[field])
                except (ValueError, TypeError):
                    continue
        return None

    async def generate_test_data(self, count: int = 100) -> None:
        """
        Generate test data for development and testing.

        Creates simulated crash game rounds with realistic distribution.
        The distribution approximates real crash game behavior with ~3% house edge.

        Args:
            count: Number of test rounds to generate.
        """
        import random

        logger.info(f"Generating {count} test rounds...")

        for i in range(count):
            # Simulate crash game distribution (house edge ~3%)
            u = random.random()
            if u < 0.03:  # 3% instant crash
                multiplier = 1.0
            else:
                # Exponential distribution for crash games
                multiplier = min(0.97 / (1 - u), 10000)
                multiplier = round(multiplier, 2)

            round_id = f"test_{datetime.now().timestamp()}_{i}"

            # Generate random coordinates for Space XY theme
            coord_x = round(random.uniform(0, 100), 2) if multiplier > 1.0 else None
            coord_y = round(random.uniform(0, 100), 2) if multiplier > 1.0 else None

            try:
                await self.save_round(round_id, multiplier, coord_x, coord_y)
            except ValueError as e:
                logger.warning(f"Skipping invalid test round: {e}")

            # Small delay to avoid overwhelming the database
            await asyncio.sleep(0.01)

        logger.info(f"Test data generation complete: {count} rounds created")

    async def run(
        self,
        demo_url: Optional[str] = None,
        test_mode: bool = False
    ) -> None:
        """
        Main collection loop.

        Initializes the database and starts data collection from either
        a live demo URL or generates test data.

        Args:
            demo_url: URL of the demo game to collect from.
            test_mode: If True, generate test data instead of collecting.

        Raises:
            ValueError: If neither demo_url nor test_mode is specified.
        """
        logger.info("Starting Space XY collector...")

        await self.init_db()
        self.running = True

        try:
            if test_mode:
                logger.info("Running in test mode - generating test data")
                await self.generate_test_data(1000)
            elif demo_url:
                logger.info(f"Collecting from demo URL: {demo_url}")
                await self.collect_with_playwright(demo_url)
            else:
                error_msg = "No demo URL provided and not in test mode"
                logger.error(error_msg)
                raise ValueError(error_msg)
        except Exception as e:
            logger.error(f"Collection failed: {e}", exc_info=True)
            raise
        finally:
            self.running = False
            logger.info(
                f"Collector stopped. Total rounds collected: {self.rounds_collected}"
            )

    def stop(self) -> None:
        """
        Stop the collector gracefully.

        Sets the running flag to False, which will cause the collection
        loop to exit on its next iteration.
        """
        logger.info("Stop requested - collector will shut down gracefully")
        self.running = False


# =============================================================================
# Main Entry Point
# =============================================================================

async def main() -> None:
    """
    Main entry point for the collector.

    Parses command line arguments and starts the collector in either
    test mode or live collection mode.
    """
    import sys

    collector = SpaceXYCollector()

    # Check for test mode flag
    test_mode = "--test" in sys.argv

    if test_mode:
        logger.info("Starting in test mode")
        await collector.run(test_mode=True)
    else:
        # Try to collect from BGaming demo
        demo_url = os.getenv("DEMO_URL", "https://demo.bgaming.com/spacexy")
        logger.info(f"Starting collection from: {demo_url}")
        logger.info("Note: This may require additional configuration based on BGaming's demo structure")

        try:
            await collector.run(demo_url=demo_url)
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")
            collector.stop()
        except Exception as e:
            logger.error(f"Collector failed: {e}", exc_info=True)
            raise


if __name__ == "__main__":
    asyncio.run(main())
