import csv
import json
from pathlib import Path
ELEMENTS = {"Pyro", "Hydro", "Dendro", "Electro", "Cryo", "Anemo", "Geo"}

# One-off hardcoded paths.
INPUT_CSV = Path.home() / "Downloads" / "erc_data.csv"
OUTPUT_JSON = Path(__file__).resolve().parent.parent / "src" / "lib" / "data2.json"


def parse_number(raw):
    if raw is None:
        return None
    value = raw.strip().replace("%", "")
    if value == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def has_value(number):
    return number is not None and abs(number) > 1e-9


def build_gen_entries(element, particles, flat, per_second, duration):
    entries = []

    if has_value(per_second):
        turret = {
            "type": "particle_turret",
            "amount": per_second,
            "element": element,
        }
        if has_value(duration):
            turret["duration"] = duration
        entries.append(turret)

    if has_value(particles):
        entries.append({"type": "particle", "amount": particles, "element": element})

    if has_value(flat):
        entries.append({"type": "flat", "amount": flat, "element": element})

    return entries


def build_sources(row, element):
    sources = []

    for idx in range(1, 4):
        label = (row.get(f"Label {idx}") or "").strip()
        particles = parse_number(row.get(f"Particles {idx}"))
        flat = parse_number(row.get(f"Flat {idx}"))
        per_second = parse_number(row.get(f"Per second {idx}"))
        duration = parse_number(row.get(f"Duration {idx}"))
        cooldown = parse_number(row.get(f"Cooldown {idx}"))

        gen_entries = build_gen_entries(element, particles, flat, per_second, duration)

        if not label and not has_value(cooldown) and not gen_entries:
            continue

        sources.append(
            {
                "title": label or f"Source {idx}",
                "cooldown": cooldown if cooldown is not None else 0,
                "gen": gen_entries,
            }
        )

    return sources


def row_to_character(row):
    name = (row.get("Character") or "").strip()
    if name == "":
        return None

    element = (row.get("Element") or "").strip()
    if element not in ELEMENTS:
        element = "None"

    burst_cooldown = parse_number(row.get("Burst cooldown"))
    burst_energy = parse_number(row.get("Burst Energy"))
    burst_discount = parse_number(row.get("Burst Discount"))

    energy_cost = burst_energy if burst_energy is not None else 0
    if burst_discount is not None:
        energy_cost -= burst_discount
    if energy_cost < 0:
        energy_cost = 0

    character = {
        "names": [name],
        "element": element,
        "bursts": [
            {
                "cooldown": burst_cooldown if burst_cooldown is not None else 0,
                "energy": energy_cost,
            }
        ],
        "sources": build_sources(row, element),
    }

    help_text = (row.get("Help (fixed)") or "").strip()
    if help_text:
        character["help"] = help_text

    return character


characters = []
with open(INPUT_CSV, "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        character = row_to_character(row)
        if character is not None:
            characters.append(character)

payload = {
    "$id": "/src/lib/data.json",
    "$schema": "data_schema.schema.json",
    "characters": characters,
}

with open(OUTPUT_JSON, "w", encoding="utf-8", newline="") as f:
    json.dump(payload, f, indent=2, ensure_ascii=True)
    f.write("\n")

print(f"Wrote {len(characters)} characters to {OUTPUT_JSON}")