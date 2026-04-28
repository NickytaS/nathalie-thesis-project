import json
import re
import subprocess
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = Path(__file__).resolve().parent / "resource_metrics.json"


SCENARIOS = [
    {
        "tool": "pgLoader",
        "db": "blog_db",
        "container": "pgloader_measure_blog",
        "cmd": ["docker-compose", "run", "--rm", "--name", "pgloader_measure_blog", "pgloader", "pgloader", "/config/pgloader_blog.conf"],
    },
    {
        "tool": "pgLoader",
        "db": "ecommerce_db",
        "container": "pgloader_measure_ecommerce",
        "cmd": ["docker-compose", "run", "--rm", "--name", "pgloader_measure_ecommerce", "pgloader", "pgloader", "/config/pgloader_ecommerce.conf"],
    },
    {
        "tool": "pgLoader",
        "db": "erp_db",
        "container": "pgloader_measure_erp",
        "cmd": ["docker-compose", "run", "--rm", "--name", "pgloader_measure_erp", "pgloader", "pgloader", "/config/pgloader_erp.conf"],
    },
    {
        "tool": "Mongify",
        "db": "blog_db",
        "container": "mongify_measure_blog",
        "cmd": ["docker-compose", "run", "--rm", "--name", "mongify_measure_blog", "mongify", "process", "config/mongify/database_blog.config", "config/mongify/blog_migration.rb"],
    },
    {
        "tool": "Mongify",
        "db": "ecommerce_db",
        "container": "mongify_measure_ecommerce",
        "cmd": ["docker-compose", "run", "--rm", "--name", "mongify_measure_ecommerce", "mongify", "process", "config/mongify/database_ecommerce.config", "config/mongify/ecommerce_migration.rb"],
    },
    {
        "tool": "Mongify",
        "db": "erp_db",
        "container": "mongify_measure_erp",
        "cmd": ["docker-compose", "run", "--rm", "--name", "mongify_measure_erp", "mongify", "process", "config/mongify/database_erp.config", "config/mongify/erp_migration.rb"],
    },
]


UNIT_FACTORS_MB = {
    "b": 1 / (1024 * 1024),
    "kb": 1 / 1024,
    "kib": 1 / 1024,
    "mb": 1,
    "mib": 1.048576,
    "gb": 1000,
    "gib": 1073.741824,
}


def to_mb(value: str) -> float:
    m = re.match(r"\s*([0-9]*\.?[0-9]+)\s*([A-Za-z]+)\s*", value)
    if not m:
        return 0.0
    num = float(m.group(1))
    unit = m.group(2).lower()
    factor = UNIT_FACTORS_MB.get(unit, 0.0)
    return num * factor


def parse_stats(line: str):
    # format: CPU|MEM_USED / MEM_LIMIT|BLOCK_READ / BLOCK_WRITE
    parts = line.strip().split("|")
    if len(parts) != 3:
        return 0.0, 0.0, 0.0

    cpu = float(parts[0].replace("%", "").strip() or 0.0)

    mem_used = parts[1].split("/")[0].strip()
    mem_mb = to_mb(mem_used)

    block_parts = parts[2].split("/")
    read_mb = to_mb(block_parts[0]) if len(block_parts) > 0 else 0.0
    write_mb = to_mb(block_parts[1]) if len(block_parts) > 1 else 0.0
    block_total_mb = read_mb + write_mb

    return cpu, mem_mb, block_total_mb


def read_container_stats(container: str):
    cmd = [
        "docker",
        "stats",
        "--no-stream",
        "--format",
        "{{.CPUPerc}}|{{.MemUsage}}|{{.BlockIO}}",
        container,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT)
    if proc.returncode != 0 or not proc.stdout.strip():
        return None
    return parse_stats(proc.stdout.strip().splitlines()[0])


def run_scenario(s):
    print(f"Running {s['tool']} on {s['db']} ...")
    start = time.time()
    proc = subprocess.Popen(
        s["cmd"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        text=False,
    )

    peak_cpu = 0.0
    peak_mem_mb = 0.0
    peak_block_total_mb = 0.0

    while proc.poll() is None:
        stats = read_container_stats(s["container"])
        if stats is not None:
            cpu, mem_mb, block_total_mb = stats
            peak_cpu = max(peak_cpu, cpu)
            peak_mem_mb = max(peak_mem_mb, mem_mb)
            peak_block_total_mb = max(peak_block_total_mb, block_total_mb)
        time.sleep(0.5)

    elapsed = time.time() - start
    return {
        "tool": s["tool"],
        "db": s["db"],
        "exit_code": proc.returncode,
        "elapsed_sec": round(elapsed, 3),
        "peak_cpu_percent": round(peak_cpu, 2),
        "peak_mem_mb": round(peak_mem_mb, 2),
        "peak_block_io_mb": round(peak_block_total_mb, 2),
    }


def main():
    # Ensure base services are up.
    subprocess.run(["docker-compose", "up", "-d"], cwd=ROOT, check=False)

    results = []
    for s in SCENARIOS:
        results.append(run_scenario(s))

    OUT_PATH.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Wrote metrics to: {OUT_PATH}")


if __name__ == "__main__":
    main()
