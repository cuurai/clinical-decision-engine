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


def find_project_root(start_path: Optional[Path] = None, max_levels: int = 10) -> Path:
    """
    Find the project root directory by walking up from start_path.

    The project root is identified by the presence of:
    - packages/ directory
    - openapi/ directory
    - package.json file

    Args:
        start_path: Path to start searching from (defaults to current working directory)
        max_levels: Maximum number of directory levels to walk up (default: 10)

    Returns:
        Path to project root directory (absolute path)

    Raises:
        FileNotFoundError: If project root cannot be found within max_levels
    """
    if start_path is None:
        start_path = Path.cwd()

    # Convert to absolute path if relative
    if not start_path.is_absolute():
        start_path = start_path.resolve()

    # If start_path is a file, use its parent directory
    if start_path.is_file():
        current = start_path.parent
    else:
        current = start_path

    # Project root markers - only require packages/ directory
    # This is more flexible and works with different repository structures
    # (e.g., kontnt-nextgen uses packages/core/openapi-core/ instead of openapi/)
    markers = [
        "packages",
    ]

    # Walk up directory tree
    for _ in range(max_levels):
        # Check if all markers exist at this level
        all_markers_exist = all((current / marker).exists() for marker in markers)

        if all_markers_exist:
            return current.resolve()

        # Move up one level
        parent = current.parent
        if parent == current:  # Reached filesystem root
            break
        current = parent

    # If we get here, project root wasn't found
    raise FileNotFoundError(
        f"Project root not found. Searched up from: {start_path}\n"
        f"Looking for markers: {markers}\n"
        f"Make sure you're running from within a project directory with a 'packages/' folder."
    )
