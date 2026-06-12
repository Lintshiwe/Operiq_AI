#!/usr/bin/env python3
"""
Operiq AI — Stress Test Suite
Tests the Chat API and Image Generation API under concurrent load.
"""

import asyncio
import json
import time
import statistics
import sys
from datetime import datetime
from typing import Optional

try:
    import aiohttp
except ImportError:
    print("Installing aiohttp...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp"])
    import aiohttp

BASE_URL = "https://operiq-ai.netlify.app"
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"
IMAGE_ENDPOINT = f"{BASE_URL}/api/huggingface"

# Test prompts for chat
CHAT_PROMPTS = [
    "Say hello in one word",
    "What is 2+2? Answer with just the number",
    "What color is the sky? Answer in one word",
    "Is water wet? Answer yes or no",
    "What is the capital of France? Answer in one word",
    "Name a programming language in one word",
    "What is 10*10? Answer with just the number",
    "What planet do we live on? Answer in one word",
]

# Test prompts for image gen
IMAGE_PROMPTS = [
    "A cute cat, minimalist",
    "A red rose on white background",
    "Blue ocean waves, simple",
    "Green forest, watercolor style",
]


class StressTestResult:
    def __init__(self):
        self.successes = 0
        self.failures = 0
        self.latencies: list[float] = []
        self.errors: list[str] = []
        self.responses: list[str] = []

    def add_success(self, latency: float, response: str):
        self.successes += 1
        self.latencies.append(latency)
        self.responses.append(response)

    def add_failure(self, latency: float, error: str):
        self.failures += 1
        self.latencies.append(latency)
        self.errors.append(error)

    @property
    def total(self) -> int:
        return self.successes + self.failures

    @property
    def success_rate(self) -> float:
        return (self.successes / self.total * 100) if self.total > 0 else 0.0

    @property
    def avg_latency(self) -> float:
        return statistics.mean(self.latencies) if self.latencies else 0.0

    @property
    def p50_latency(self) -> float:
        return statistics.median(self.latencies) if self.latencies else 0.0

    @property
    def p95_latency(self) -> float:
        if not self.latencies:
            return 0.0
        sorted_lats = sorted(self.latencies)
        idx = int(len(sorted_lats) * 0.95)
        return sorted_lats[min(idx, len(sorted_lats) - 1)]

    @property
    def p99_latency(self) -> float:
        if not self.latencies:
            return 0.0
        sorted_lats = sorted(self.latencies)
        idx = int(len(sorted_lats) * 0.99)
        return sorted_lats[min(idx, len(sorted_lats) - 1)]

    @property
    def min_latency(self) -> float:
        return min(self.latencies) if self.latencies else 0.0

    @property
    def max_latency(self) -> float:
        return max(self.latencies) if self.latencies else 0.0

    def summary(self, label: str) -> str:
        lines = [
            f"\n{'='*60}",
            f"  {label}",
            f"{'='*60}",
            f"  Total requests:    {self.total}",
            f"  Successes:         {self.successes} ({self.success_rate:.1f}%)",
            f"  Failures:          {self.failures}",
            f"  --- Latencies ---",
            f"  Avg:               {self.avg_latency*1000:.1f}ms",
            f"  Min:               {self.min_latency*1000:.1f}ms",
            f"  Max:               {self.max_latency*1000:.1f}ms",
            f"  P50 (median):      {self.p50_latency*1000:.1f}ms",
            f"  P95:               {self.p95_latency*1000:.1f}ms",
            f"  P99:               {self.p99_latency*1000:.1f}ms",
        ]
        if self.errors:
            lines.append(f"  --- Sample Errors ---")
            for err in self.errors[:5]:
                lines.append(f"  - {err[:100]}")
        return "\n".join(lines)


async def stress_test_chat(
    session: aiohttp.ClientSession,
    concurrency: int,
    requests_per_test: int,
    model: str = "operiq-mini",
) -> StressTestResult:
    """Run concurrent chat API requests with increasing load."""
    result = StressTestResult()
    semaphore = asyncio.Semaphore(concurrency)

    prompts = CHAT_PROMPTS * (requests_per_test // len(CHAT_PROMPTS) + 1)
    prompts = prompts[:requests_per_test]

    async def single_request(prompt: str):
        async with semaphore:
            start = time.monotonic()
            try:
                async with session.post(
                    CHAT_ENDPOINT,
                    json={"messages": [{"role": "user", "content": prompt}]},
                    headers={"x-operiq-model": model},
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as resp:
                    elapsed = time.monotonic() - start
                    text = await resp.text()

                    if resp.status == 200:
                        # Extract response text from SSE
                        response_text = ""
                        for line in text.split("\n"):
                            if line.startswith("data: ") and '"delta"' in line:
                                try:
                                    data = json.loads(line[6:])
                                    response_text += data.get("delta", "")
                                except json.JSONDecodeError:
                                    pass
                        result.add_success(elapsed, response_text.strip())
                    else:
                        result.add_failure(elapsed, f"HTTP {resp.status}: {text[:100]}")
            except asyncio.TimeoutError:
                elapsed = time.monotonic() - start
                result.add_failure(elapsed, "Timeout (>30s)")
            except Exception as e:
                elapsed = time.monotonic() - start
                result.add_failure(elapsed, str(e)[:100])

    tasks = [single_request(p) for p in prompts]
    await asyncio.gather(*tasks)
    return result


async def stress_test_image(
    session: aiohttp.ClientSession,
    concurrency: int,
    requests_per_test: int,
) -> StressTestResult:
    """Run concurrent image generation requests."""
    result = StressTestResult()
    semaphore = asyncio.Semaphore(concurrency)

    prompts = IMAGE_PROMPTS * (requests_per_test // len(IMAGE_PROMPTS) + 1)
    prompts = prompts[:requests_per_test]

    async def single_request(prompt: str):
        async with semaphore:
            start = time.monotonic()
            try:
                async with session.post(
                    IMAGE_ENDPOINT,
                    json={"prompt": prompt},
                    timeout=aiohttp.ClientTimeout(total=65),
                ) as resp:
                    elapsed = time.monotonic() - start
                    data = await resp.json()

                    if resp.status == 200 and data.get("success"):
                        result.add_success(elapsed, "image_generated")
                    else:
                        err = data.get("error", "unknown error")
                        result.add_failure(elapsed, f"HTTP {resp.status}: {err[:100]}")
            except asyncio.TimeoutError:
                elapsed = time.monotonic() - start
                result.add_failure(elapsed, "Timeout (>65s)")
            except Exception as e:
                elapsed = time.monotonic() - start
                result.add_failure(elapsed, str(e)[:100])

    tasks = [single_request(p) for p in prompts]
    await asyncio.gather(*tasks)
    return result


async def run_ramp_test_chat(
    session: aiohttp.ClientSession,
    label: str,
    model: str = "operiq-mini",
    concurrency_levels: Optional[list[int]] = None,
    requests_per_level: int = 10,
):
    """Gradually ramp up concurrency to find breaking point."""
    if concurrency_levels is None:
        concurrency_levels = [1, 3, 5, 10, 15, 20, 30]

    print(f"\n{'='*60}")
    print(f"  CHAT API — {label} (model: {model})")
    print(f"  Ramp test: concurrency levels = {concurrency_levels}")
    print(f"{'='*60}")

    for concurrency in concurrency_levels:
        print(f"\n  >>> Concurrency: {concurrency} <<<")
        result = await stress_test_chat(session, concurrency, requests_per_level, model)
        print(
            f"  Results: {result.successes}/{result.total} success "
            f"({result.success_rate:.0f}%) | "
            f"avg: {result.avg_latency*1000:.0f}ms | "
            f"p95: {result.p95_latency*1000:.0f}ms | "
            f"max: {result.max_latency*1000:.0f}ms"
        )

        if result.failures > 0:
            print(f"  ⚠  {result.failures} failures detected!")
            if result.success_rate < 50:
                print(f"  ✗  Breaking point found at concurrency={concurrency}")
                break

        await asyncio.sleep(1)  # cooldown between levels


async def run_steady_test_chat(
    session: aiohttp.ClientSession,
    label: str,
    model: str = "operiq-mini",
    concurrency: int = 5,
    requests: int = 25,
) -> StressTestResult:
    """Run a steady-state load test at fixed concurrency."""
    print(f"\n  >>> Steady test: concurrency={concurrency}, requests={requests} <<<")
    result = await stress_test_chat(session, concurrency, requests, model)
    print(result.summary(f"CHAT API — {label} (steady @ concurrency={concurrency})"))
    return result


async def run_compare_models(session: aiohttp.ClientSession):
    """Compare different model latencies."""
    models = ["operiq-mini", "operiq-nano", "operiq-plus", "operiq-pro"]
    print(f"\n{'='*60}")
    print(f"  MODEL COMPARISON")
    print(f"{'='*60}")

    for model in models:
        result = await stress_test_chat(session, 3, 6, model)
        print(
            f"  {model:20s} | "
            f"success: {result.successes}/{result.total} | "
            f"avg: {result.avg_latency*1000:6.0f}ms | "
            f"p95: {result.p95_latency*1000:6.0f}ms"
        )
        await asyncio.sleep(0.5)


async def main():
    print(f"Operiq AI Stress Test Suite")
    print(f"Started: {datetime.now().isoformat()}")
    print(f"Target:  {BASE_URL}")

    connector = aiohttp.TCPConnector(limit=100, force_close=True)

    async with aiohttp.ClientSession(connector=connector) as session:
        # Phase 1: Quick smoke test
        print(f"\n{'='*60}")
        print(f"  PHASE 1: Smoke Test")
        print(f"{'='*60}")
        smoke = await stress_test_chat(session, 1, 3, "operiq-mini")
        print(smoke.summary("Smoke Test"))

        if smoke.success_rate < 100:
            print("\n  ⛔ Smoke test failed. Aborting further tests.")
            sys.exit(1)

        # Phase 2: Model comparison
        print(f"\n{'='*60}")
        print(f"  PHASE 2: Model Comparison")
        print(f"{'='*60}")
        await run_compare_models(session)

        # Phase 3: Ramp test — operiq-mini
        await run_ramp_test_chat(
            session,
            "Mini Model Ramp",
            model="operiq-mini",
            concurrency_levels=[1, 3, 5, 10, 15, 20],
            requests_per_level=8,
        )

        # Phase 4: Ramp test — operiq-nano (faster model)
        await run_ramp_test_chat(
            session,
            "Nano Model Ramp",
            model="operiq-nano",
            concurrency_levels=[1, 5, 10, 20, 30],
            requests_per_level=8,
        )

        # Phase 5: Steady load tests
        print(f"\n{'='*60}")
        print(f"  PHASE 5: Steady Load Tests")
        print(f"{'='*60}")
        steady1 = await run_steady_test_chat(session, "operiq-mini @ 5 conc", "operiq-mini", 5, 20)
        steady2 = await run_steady_test_chat(session, "operiq-mini @ 10 conc", "operiq-mini", 10, 30)
        steady3 = await run_steady_test_chat(session, "operiq-nano @ 10 conc", "operiq-nano", 10, 30)

        # Phase 6: Image gen test (brief — it's slow)
        print(f"\n{'='*60}")
        print(f"  PHASE 6: Image Generation Test")
        print(f"{'='*60}")
        img_result = await stress_test_image(session, 1, 2)
        print(img_result.summary("Image Generation"))

    # Final summary
    print(f"\n{'='*60}")
    print(f"  STRESS TEST COMPLETE")
    print(f"  Finished: {datetime.now().isoformat()}")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
