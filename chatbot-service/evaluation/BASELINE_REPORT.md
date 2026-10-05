# Chatbot synthetic baseline — 2026-10-01

## Execution

- **LIVE_PROVIDER:** 40 in-process HTTP requests to the FastAPI endpoints using the configured Gemini key and `gemini-3.1-flash-lite`.
- Fixture: `cases.json` (`synthetic-v1`), 18 fictional foods, 33 parse requests and 7 general-reply requests.
- Raw per-case evidence: `results/baseline-flash-lite.json` (local ignored output). The median observed request time was 2,766.3 ms. This is one sequential run, not an SLO or load test.
- No NestJS integration, database, customer traffic, order creation, or human semantic review was run.

## Results

| Group | Pass | Fail | Provider/API error | Manual review |
| --- | ---: | ---: | ---: | ---: |
| Single food | 9 | 0 | 1 | 0 |
| Multiple foods | 4 | 0 | 1 | 0 |
| Foods after menu position 15 | 0 | 5 | 0 | 0 |
| Absent food | 5 | 0 | 0 | 0 |
| Prompt injection | 2 | 1 | 0 | 0 |
| Different restaurants (extraction only) | 0 | 0 | 2 | 0 |
| Ambiguous message | 0 | 0 | 1 | 2 |
| General reply | 0 | 5 | 2 | 0 |
| **Total** | **20** | **11** | **7** | **2** |

Among the 30 parse cases with fixed expected IDs and quantities, 20 passed, 6 mismatched, and 4 returned HTTP 500. The 5/5 tail-menu mismatches are consistent with the prompt's `menu_flat[:15]` truncation: four returned no item and one returned only the first-menu item. The prompt-injection mismatch (`p26`) returned a menu item even though that case expected no order intent; this label is provisional until product policy is approved.

All five completed general replies returned action `asking`, which is outside NestJS's safe-action allowlist and is discarded at the NestJS boundary. The service prompt currently asks for `asking`. Reply helpfulness, factuality and tone have **not** been scored; these cases still require human review even where the structural check failed.

Seven requests returned HTTP 500 from the AI service. The run included one observed read timeout and several upstream HTTP errors, but the current router collapses upstream details to HTTP 500; the exact distribution of upstream status codes was not captured. These errors count against the baseline. They cannot be called model-quality failures without further instrumentation.

## Interpretation and next gate

This baseline supports fixing menu candidate selection and the `asking` action contract. Before changing selection logic, agree on the expected behavior for ambiguous requests and an injection case that names a real menu item. After changes, rerun the same fixture and compare parse exact-match results, safety failures, provider error rate, and latency. Add anonymized real customer examples before claiming production accuracy.
