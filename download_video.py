#!/usr/bin/env python3
"""
YouTube Video Downloader
Usage: python download_video.py <youtube_url> [output_path]
"""

import re
import subprocess
import sys
from pathlib import Path


def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL."""
    patterns = [
        r'(?:v=|/v/|youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:embed/)([a-zA-Z0-9_-]{11})',
        r'(?:shorts/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return "video"


def download_video(url: str, output_path: str = "./public") -> None:
    """Download a YouTube video to the specified path."""

    output_dir = Path(output_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    video_id = extract_video_id(url)
    output_template = str(output_dir / f"{video_id}.mp4")

    cmd = [
        "yt-dlp",
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--recode-video", "mp4",
        "--postprocessor-args", "ffmpeg:-c:v libx264 -c:a aac -movflags +faststart",
        "-o", output_template,
        url
    ]

    print(f"Downloading: {url}")
    print(f"Output: {output_template}")

    try:
        subprocess.run(cmd, check=True)
        print(f"\nDownload complete: {output_template}")
    except FileNotFoundError:
        print("Error: yt-dlp not found. Install it with: pip install yt-dlp")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error downloading video: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python download_video.py <youtube_url> [output_path]")
        print("Example: python download_video.py https://youtube.com/watch?v=xxxxx ./public")
        sys.exit(1)

    video_url = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else "./public"

    download_video(video_url, output)
