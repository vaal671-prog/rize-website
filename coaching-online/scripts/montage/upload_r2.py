#!/usr/bin/env python3
"""
Uploads a video file to the vd-performance-videos R2 bucket and prints its
public URL. Credentials come from real environment variables if set
(GitHub Actions secrets), else from a local .env file (gitignored, never
commit) for local dev.

Usage:
  python3 upload_r2.py --file final.mp4 --key videos/valentin.mp4
"""

import argparse
import os
from pathlib import Path

import boto3

ENV_PATH = Path(__file__).parent / ".env"
REQUIRED_KEYS = ["R2_ACCOUNT_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_URL"]


def load_env() -> dict[str, str]:
    if all(k in os.environ for k in REQUIRED_KEYS):
        return {k: os.environ[k].strip() for k in REQUIRED_KEYS}

    env = {}
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()
    return env


def _client(env: dict[str, str]):
    return boto3.client(
        "s3",
        endpoint_url=env["R2_ACCOUNT_ENDPOINT"],
        aws_access_key_id=env["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=env["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
    )


def upload(file_path: Path, key: str) -> str:
    env = load_env()
    _client(env).upload_file(
        str(file_path),
        env["R2_BUCKET"],
        key,
        ExtraArgs={"ContentType": "video/mp4"},
    )
    return f"{env['R2_PUBLIC_URL']}/{key}"


def upload_bytes(data: bytes, key: str, content_type: str) -> str:
    env = load_env()
    _client(env).put_object(Bucket=env["R2_BUCKET"], Key=key, Body=data, ContentType=content_type)
    return f"{env['R2_PUBLIC_URL']}/{key}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True, type=Path)
    parser.add_argument("--key", required=True)
    args = parser.parse_args()
    url = upload(args.file, args.key)
    print(url)
