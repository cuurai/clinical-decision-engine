"""
File system utilities
"""

from pathlib import Path
from typing import Optional


def ensure_directory(path: Path) -> None:
    """Ensure directory exists, create if it doesn't"""
    path.mkdir(parents=True, exist_ok=True)


def write_file(path: Path, content: str, encoding: str = "utf-8") -> None:
    """Write content to file"""
    ensure_directory(path.parent)
    path.write_text(content, encoding=encoding)


def read_file(path: Path, encoding: str = "utf-8") -> str:
    """Read file content"""
    return path.read_text(encoding=encoding)


def file_exists(path: Path) -> bool:
    """Check if file exists"""
    return path.exists() and path.is_file()


def directory_exists(path: Path) -> bool:
    """Check if directory exists"""
    return path.exists() and path.is_dir()


def clean_directory(path: Path, pattern: str = "*") -> None:
    """Clean directory contents matching pattern"""
    if not path.exists():
        return

    for file_path in path.glob(pattern):
        if file_path.is_file():
            file_path.unlink()
        elif file_path.is_dir():
            import shutil
            shutil.rmtree(file_path)


def copy_file(source: Path, destination: Path) -> None:
    """Copy file from source to destination"""
    ensure_directory(destination.parent)
    import shutil
    shutil.copy2(source, destination)


def move_file(source: Path, destination: Path) -> None:
    """Move file from source to destination"""
    ensure_directory(destination.parent)
    import shutil
    shutil.move(source, destination)
