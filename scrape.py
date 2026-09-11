"""
Generic Apify scraper runner.

Usage:
    python scrape.py --url https://example.com --url https://example.org
    python scrape.py --url https://example.com --actor apify/website-content-crawler --output data/pages.csv

Requires APIFY_API_TOKEN to be set in a .env file (see .env.example).
"""

import argparse
import os
import sys

import pandas as pd
from apify_client import ApifyClient
from dotenv import load_dotenv


def get_client() -> ApifyClient:
    load_dotenv()
    token = os.environ.get("APIFY_API_TOKEN")
    if not token or token == "your_apify_api_token_here":
        sys.exit(
            "APIFY_API_TOKEN is not set. Copy .env.example to .env and add your "
            "real token from the Apify Console (Settings -> Integrations)."
        )
    return ApifyClient(token)


def run_actor(client: ApifyClient, actor_id: str, urls: list[str]) -> list[dict]:
    run_input = {"startUrls": [{"url": url} for url in urls]}
    run = client.actor(actor_id).call(run_input=run_input)
    dataset_id = run["defaultDatasetId"]
    return list(client.dataset(dataset_id).iterate_items())


def main():
    parser = argparse.ArgumentParser(description="Run an Apify actor and collect its results.")
    parser.add_argument("--url", action="append", required=True, help="URL to scrape (repeatable).")
    parser.add_argument(
        "--actor",
        default="apify/website-content-crawler",
        help="Apify actor ID to run (default: apify/website-content-crawler).",
    )
    parser.add_argument("--output", help="Optional path to save results as CSV.")
    args = parser.parse_args()

    client = get_client()
    items = run_actor(client, args.actor, args.url)

    print(f"Fetched {len(items)} item(s) from actor '{args.actor}'.")

    if args.output:
        pd.DataFrame(items).to_csv(args.output, index=False)
        print(f"Saved results to {args.output}")
    else:
        for item in items[:5]:
            print(item)


if __name__ == "__main__":
    main()
