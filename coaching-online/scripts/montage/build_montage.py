#!/usr/bin/env python3
"""
Builds one personalized VD Performance result video by concatenating the
intro, one clip per answered questionnaire step (in STEP_ORDER), and the
outro — all defined in manifest.json (Drive file IDs).

Usage:
  python3 build_montage.py --answers answers.json --out final.mp4 [--cache-dir cache]

answers.json shape (matches the "Consultations" sheet columns):
  {
    "age": "18-24",
    "workActivity": "modere",
    "sportLevel": "confirme",
    "frequencyPerWeek": "4",
    "currentSilhouette": "legerement-enrobe",
    "targetSilhouette": "athletique",
    "goal": "perte_gras",
    "kgToLose": "1-5",
    "pace": "rapide",
    "sleepQuality": 20,
    "stressLevel": 27,
    "metabolism": 43
  }

Steps with no matching clip (e.g. "kgToLose" until it's filmed, or any
key missing/blank) are silently skipped — the montage just proceeds
without that segment.
"""

import argparse
import json
import re
import subprocess
import sys
import traceback
from pathlib import Path

MANIFEST_PATH = Path(__file__).parent / "manifest.json"

# 0-100 slider steps use "faible" / "moyen" / "eleve" clip buckets.
SLIDER_STEPS = {"sleepQuality", "stressLevel", "metabolism"}

# stressLevel's slider runs "Très stressé" (0) -> "Pas stressé" (100) — the
# opposite direction from sleepQuality/metabolism, where a high raw value
# means "high/good X". A high raw stressLevel means LOW actual stress, so
# the raw value must be inverted before bucketing to pick the right clip
# (e.g. raw=95 = barely stressed = "faible", not "eleve").
INVERTED_SLIDER_STEPS = {"stressLevel"}

# The sheet column for "frequency" is named "frequencyPerWeek"; the manifest
# (and clip filenames) use the shorter "frequency".
ANSWER_KEY_ALIASES = {"frequency": "frequencyPerWeek"}

TARGET_W, TARGET_H, TARGET_FPS = 720, 1280, 30


def bucket_slider(value) -> str:
    v = float(value)
    if v < 34:
        return "faible"
    if v < 67:
        return "moyen"
    return "eleve"


def resolve_clip_id(manifest: dict, step: str, answers: dict) -> str | None:
    key = ANSWER_KEY_ALIASES.get(step, step)
    raw = answers.get(key)
    if raw is None or raw == "":
        return None
    if step in SLIDER_STEPS:
        v = float(raw)
        if step in INVERTED_SLIDER_STEPS:
            v = 100 - v
        value = bucket_slider(v)
    else:
        value = str(raw)
    return manifest["clips"].get(step, {}).get(value)


def _looks_like_html(path: Path) -> bool:
    with open(path, "rb") as f:
        return f.read(15).lstrip().startswith(b"<!DOCTYPE")


def download(file_id: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 0 and not _looks_like_html(dest):
        print(f"  cached: {dest.name}")
        return

    print(f"  downloading {dest.name} ...")
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    cookie_jar = dest.with_suffix(".cookies")
    subprocess.run(
        ["curl", "-sL", "-c", str(cookie_jar), url, "-o", str(dest)],
        check=True,
    )

    if _looks_like_html(dest):
        # Files over Drive's size threshold serve a "virus scan warning"
        # interstitial instead of the file. Its form carries a uuid token
        # needed to fetch the real content from usercontent.google.com.
        html = dest.read_text(errors="ignore")
        uuid_match = re.search(r'name="uuid" value="([^"]+)"', html)
        if not uuid_match:
            raise RuntimeError(f"Download failed for {file_id}: unexpected response (no uuid in warning page)")
        confirm_url = (
            "https://drive.usercontent.google.com/download"
            f"?id={file_id}&export=download&confirm=t&uuid={uuid_match.group(1)}"
        )
        subprocess.run(
            ["curl", "-sL", "-b", str(cookie_jar), confirm_url, "-o", str(dest)],
            check=True,
        )
    cookie_jar.unlink(missing_ok=True)

    if dest.stat().st_size < 1000 or _looks_like_html(dest):
        dest.unlink(missing_ok=True)
        raise RuntimeError(f"Download failed for {file_id}: response is not a video file")


def get_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(result.stdout.strip())


def detect_speech_bounds(path: Path, noise_db: str = "-30dB", min_silence: float = 0.3) -> tuple[float, float]:
    """Returns (start, end) trim points that cut leading/trailing dead air
    (the raw clips have several seconds of silence before/after the actual
    line — that's the "10s of nothing" between segments), leaving a small
    pad so speech doesn't feel clipped."""
    duration = get_duration(path)
    result = subprocess.run(
        ["ffmpeg", "-i", str(path), "-af", f"silencedetect=noise={noise_db}:d={min_silence}", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    log = result.stderr
    starts = [float(m) for m in re.findall(r"silence_start:\s*([\d.]+)", log)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([\d.]+)", log)]
    if len(starts) == len(ends) + 1:
        ends.append(duration)  # trailing silence ran to end of file
    intervals = list(zip(starts, ends))

    pad = 0.12
    trim_start = 0.0
    if intervals and intervals[0][0] < 0.15:
        trim_start = max(0.0, intervals[0][1] - pad)

    trim_end = duration
    if intervals and (duration - intervals[-1][1]) < 0.15:
        trim_end = min(duration, intervals[-1][0] + pad)

    if trim_end - trim_start < 1.0:
        return 0.0, duration  # sanity guard: never trim almost the whole clip away
    return trim_start, trim_end


def build(answers_path: Path, out_path: Path, cache_dir: Path) -> None:
    manifest = json.loads(MANIFEST_PATH.read_text())
    answers = json.loads(answers_path.read_text())
    cache_dir.mkdir(parents=True, exist_ok=True)

    ordered_ids: list[tuple[str, str]] = [("intro", manifest["intro"])]
    for step in manifest["stepOrder"]:
        clip_id = resolve_clip_id(manifest, step, answers)
        if clip_id:
            ordered_ids.append((step, clip_id))
        else:
            print(f"  skipping {step}: no clip for answer {answers.get(ANSWER_KEY_ALIASES.get(step, step))!r}")
    ordered_ids.append(("outro", manifest["outro"]))

    print(f"Segments ({len(ordered_ids)}): {[s for s, _ in ordered_ids]}")

    local_paths: list[Path] = []
    for step, clip_id in ordered_ids:
        dest = cache_dir / f"{clip_id}.mp4"
        download(clip_id, dest)
        local_paths.append(dest)

    print("Detecting dead air to trim at each clip's start/end...")
    bounds: list[tuple[float, float]] = []
    for (step, _), path in zip(ordered_ids, local_paths):
        start, end = detect_speech_bounds(path)
        print(f"  {step}: trim [{start:.2f}s, {end:.2f}s]")
        bounds.append((start, end))

    # Normalize every input to the same resolution/fps/audio format, then
    # concat via filter_complex — required because the source clips were
    # shot on different devices/settings (mixed 1080x1920 / 2160x3840).
    filter_parts = []
    concat_inputs = []
    for i, (start, end) in enumerate(bounds):
        filter_parts.append(
            f"[{i}:v]trim=start={start}:end={end},setpts=PTS-STARTPTS,"
            f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=decrease,"
            f"pad={TARGET_W}:{TARGET_H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={TARGET_FPS}[v{i}];"
            f"[{i}:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS,"
            f"aformat=sample_rates=44100:channel_layouts=stereo[a{i}]"
        )
        concat_inputs.append(f"[v{i}][a{i}]")
    filter_complex = ";".join(filter_parts) + ";" + "".join(concat_inputs) + \
        f"concat=n={len(local_paths)}:v=1:a=1[outv][outa]"

    cmd = ["ffmpeg", "-y"]
    for p in local_paths:
        cmd += ["-i", str(p)]
    cmd += [
        "-filter_complex", filter_complex,
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "128k",
        str(out_path),
    ]

    print("Running ffmpeg concat...")
    subprocess.run(cmd, check=True)
    print(f"Done: {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--answers", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--cache-dir", default=Path("cache"), type=Path)
    args = parser.parse_args()
    try:
        build(args.answers, args.out, args.cache_dir)
    except Exception:
        traceback.print_exc()
        sys.exit(1)
