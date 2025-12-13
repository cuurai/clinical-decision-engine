"""
Structured logging with Rich for beautiful terminal output
"""

from typing import Optional
from pathlib import Path

from rich.console import Console
from rich.logging import RichHandler
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
import logging

from cuur_codegen.core.config import LogLevel


class Logger:
    """Structured logger with Rich formatting"""

    def __init__(self, level: LogLevel = LogLevel.INFO, verbose: bool = False):
        self.verbose = verbose
        self.console = Console()
        self.logger = logging.getLogger("quub-codegen")
        # Convert LogLevel enum to logging level
        level_value = level.value.upper() if isinstance(level, LogLevel) else str(level).upper()
        self.logger.setLevel(getattr(logging, level_value))

        # Remove default handlers
        self.logger.handlers.clear()

        # Add Rich handler
        handler = RichHandler(
            console=self.console,
            show_time=verbose,
            show_path=verbose,
            rich_tracebacks=True,
            markup=True,
        )
        handler.setFormatter(logging.Formatter("%(message)s", datefmt="[%X]"))
        self.logger.addHandler(handler)

    def debug(self, message: str) -> None:
        """Log debug message"""
        self.logger.debug(message)

    def info(self, message: str) -> None:
        """Log info message"""
        self.logger.info(message)

    def warn(self, message: str) -> None:
        """Log warning message"""
        self.logger.warning(message)

    def error(self, message: str) -> None:
        """Log error message"""
        self.logger.error(message)

    def success(self, message: str) -> None:
        """Log success message with green styling"""
        self.console.print(f"[green]✓[/green] {message}")

    def step(self, message: str) -> None:
        """Log step message with blue styling"""
        self.console.print(f"[blue]→[/blue] {message}")

    def header(self, title: str, subtitle: Optional[str] = None) -> None:
        """Print header panel"""
        content = f"[bold cyan]{title}[/bold cyan]"
        if subtitle:
            content += f"\n[dim]{subtitle}[/dim]"
        panel = Panel(content, border_style="cyan", padding=(1, 2))
        self.console.print(panel)

    def table(self, title: str, rows: list[dict[str, str]]) -> None:
        """Print data table"""
        if not rows:
            return

        table = Table(title=title, show_header=True, header_style="bold magenta")
        # Get columns from first row
        columns = list(rows[0].keys())
        for col in columns:
            table.add_column(col)

        for row in rows:
            table.add_row(*[str(row.get(col, "")) for col in columns])

        self.console.print(table)

    def progress(self) -> Progress:
        """Create progress bar context manager"""
        return Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
            console=self.console,
        )


def create_logger(level: LogLevel = LogLevel.INFO, verbose: bool = False) -> Logger:
    """Create a logger instance"""
    return Logger(level=level, verbose=verbose)
