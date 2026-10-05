# Synthetic evaluation comparison — 2026-10-01

## Runs

| Run | Provider/model | Fixed-label parse cases | General and ambiguous cases | Median request time |
| --- | --- | --- | --- | ---: |
| Before changes | Gemini / `gemini-3.1-flash-lite` | 20 pass, 6 mismatch, 4 HTTP errors | 5 general contract failures, 3 errors, 2 manual reviews | 2,766.3 ms |
| After candidate selection, action filtering, and provider error typing | Same provider/model and same `synthetic-v1` fixture | 25 pass, 0 mismatch, 5 provider errors | 6 general structural reviews, 3 errors, 1 ambiguous review | 3,499.3 ms |

The complete per-case outputs are local ignored artifacts at `results/baseline-flash-lite.json` and `results/post-change-40.json`. Both runs made 40 sequential in-process HTTP requests to FastAPI. They did not call NestJS or create orders. A pass here means the fixed expected IDs and quantities matched; it does not establish customer-facing accuracy.

## What changed and what did not

- **Menu tail:** all five fixed-label cases for foods at positions 16–18 changed from mismatch to pass. The service now ranks candidates from the full menu before sending at most 15 order items or 12 general-chat items to the model.
- **General action:** five completed general replies had unsupported `asking` actions before. In the complete rerun, the six completed general replies had no unsupported action. Their natural-language quality still needs human review.
- **Provider errors:** the complete rerun recorded five upstream HTTP 503 responses, two HTTP 429 responses, and one timeout. The baseline had seven opaque HTTP 500 errors. Because the provider conditions differed between runs, do not attribute a change in error count or median latency to candidate selection.
- **Safety finding after the complete rerun:** case `g06` produced text falsely claiming an order had been created, even though the action field was filtered. The parser and prompt now prevent that claim in this endpoint. A focused live rerun of `g06` in `results/post-guard-g06.json` returned a safe reply with no action. The final guard was validated by this focused live case and unit tests; a second full 40-case provider run was not made.

## Remaining decisions

The expected no-order label for injection case `p26`, ambiguous quantity/preferences, and the customer-visible wording for mixed-restaurant selections need product review. The 40-case fixture is synthetic; anonymized real messages and human review of general replies are needed before claiming production quality. Provider 429/503/timeout handling can be improved only with an explicit latency budget: the NestJS client currently times out after 10 seconds, so unbounded retries would be harmful.
