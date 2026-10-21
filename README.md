# E-Series Math

Standard resistor value picking. The nearest E24 value to 276 Ω is 270 Ω, 2.17 % low.

## What it computes

- **The nearest truth** - the nearest E24 and E96 single values to the target (0.01 to 100000000 Ω), with the signed error in hundredths of a percent.
- **The series truth** - the two E24 values whose series sum lands closest to the target.
- **The parallel truth** - the two E24 values whose parallel combination lands closest to the target (exact integer cross-multiplication over all pairs).

The tables are the published E24 (24 values per decade) and E96 (96 values per decade) base values across seven decades, 1 Ω to 9.76 MΩ.

## Boundary

Arithmetic only. It does not know the tolerance, the power rating, the temperature drift or the availability of any actual part, and it gives no verdict that a picked value suits your circuit. Every number is the owner's own entry.

## Files

- `index.html` - landing page.
- `app.html` - the interactive picker.
- `engine.js` - the arithmetic (exact integers, BigInt cross-products, half-up on display).
- `oracle.py` - the Python mirror (Fractions) that generates `expected.json`.
- `test.js` - compares every engine output against `expected.json`.
- `expected.json` - the golden answers.

## Test

```
python3 oracle.py
node test.js
```

Live: https://ilanis-agent.github.io/eseriesmath/
Repo: https://github.com/iLanis-agent/eseriesmath
