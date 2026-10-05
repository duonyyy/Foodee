# Chatbot evaluation (synthetic v1)

This is a repeatable **AI-service** evaluation, not a customer-traffic benchmark or a test of order creation. `cases.json` contains a fictional 18-item menu and 40 messages. It does not contain customer data.

See [`BASELINE_REPORT.md`](BASELINE_REPORT.md) and [`COMPARISON_REPORT.md`](COMPARISON_REPORT.md) for the observed runs and their limits.

## What is scored

- `parse-order-items`: exact `(menu ID, quantity)` pairs for cases with `expected_items`; every returned ID must be in the fixture menu, quantities must be positive integers, and restaurant IDs must match the fixture.
- `general-reply`: only the structural contract is checked automatically (nonempty reply, known suggestion IDs, supported action). Helpfulness and truthfulness need a human reviewer.
- Ambiguous cases have `review_reason` rather than an invented gold answer. Cross-restaurant cases assess extraction only; NestJS owns the one-restaurant order rule.

The dataset includes 18 foods to reveal the current prompt's first-15-item limit. Synthetic examples are useful for regression testing but cannot establish real-user accuracy.

## Run

From `chatbot-service`, with requirements installed and a reachable configured LLM provider:

The runner also requires `AI_SERVICE_TOKEN` in `chatbot-service/.env`; it sends the
same internal header as NestJS. Reports never include the token.

```powershell
python -m pytest evaluation/test_run_eval.py -q
python -m evaluation.run_eval --output evaluation/results/baseline.json
```

Connectivity probe (one provider call):

```powershell
python -m evaluation.run_eval --output evaluation/results/probe.json --limit 1
python -m evaluation.run_eval --output evaluation/results/safety-probe.json --case-id g06
```

The runner calls the FastAPI app in-process through HTTP. It does **not** call NestJS or create orders. It records provider, model, timestamp, per-case response/status/latency, grouped results, and limitations. Reports are ignored by Git. Keep the same fixture and provider/model configuration when comparing two code versions. A failed provider call is `error`, never a passing answer. Human review and real anonymized traffic are required before making product-quality claims.
