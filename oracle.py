import json, random
from fractions import Fraction

def hu(num, den):
    return Fraction((2*num + den) - ((2*num + den) % (2*den)), 2*den)

def shu(num, den):
    return -hu(-num, den) if num < 0 else hu(num, den)

def dec(v, places=2):
    if v < 0: return "-" + dec(-v, places)
    base = 10**places
    n = v.numerator // v.denominator
    s = str(n // base); f = str(n % base).zfill(places).rstrip("0")
    return s + "." + f if f else s

def s100(n):
    w, f = divmod(n, 100)
    return f"{w}.{f:02d}".rstrip("0").rstrip(".")

E24B = [10,11,12,13,15,16,18,20,22,24,27,30,33,36,39,43,47,51,56,62,68,75,82,91]
E96B = [100,102,105,107,110,113,115,118,121,124,127,130,133,137,140,143,147,150,154,158,162,165,169,174,178,182,187,191,196,200,205,210,215,221,226,232,237,243,249,255,261,267,274,280,287,294,301,309,316,324,332,340,348,357,365,374,383,392,402,412,422,432,442,453,464,475,487,499,511,523,536,549,562,576,590,604,619,634,649,665,681,698,715,732,750,768,787,806,825,845,866,887,909,931,953,976]
V24 = [b*10**(d+1) for d in range(7) for b in E24B]
V96 = [b*10**d for d in range(7) for b in E96B]

def errtext(e):
    if e == 0: return "exact"
    return f"{dec(Fraction(-e))} % low" if e < 0 else f"{dec(Fraction(e))} % high"

def nearest(vals, x):
    best, bd = vals[0], abs(x - vals[0])
    for v in vals[1:]:
        dd = abs(x - v)
        if dd < bd: bd, best = dd, v
    return best

def nearest_t(t):
    a, b = nearest(V24, t), nearest(V96, t)
    ea, eb = shu((a-t)*10000, t), shu((b-t)*10000, t)
    return (f"The nearest E24 value to {dec(Fraction(t))} Ω is {dec(Fraction(a))} Ω, {errtext(ea)}; "
            f"the nearest E96 is {dec(Fraction(b))} Ω, {errtext(eb)}.")
def series_t(t):
    best = None
    for v1 in V24:
        rem = t - v1
        v2 = V24[0] if rem <= V24[0] else nearest(V24, rem)
        s, diff = v1 + v2, abs(v1 + v2 - t)
        if best is None or diff < best[2]: best = (v1, v2, diff, s)
    v1, v2, _, s = best
    e = shu((s-t)*10000, t)
    tail = "exact." if e == 0 else f"{errtext(e)} of {dec(Fraction(t))} Ω."
    return (f"Two E24 values in series come closest with {dec(Fraction(v1))} Ω + {dec(Fraction(v2))} Ω, "
            f"landing at {dec(Fraction(s))} Ω, {tail}")
def parallel_t(t):
    bn = bd = None; bv1 = bv2 = 0
    for i, x in enumerate(V24):
        for y in V24[i:]:
            num, den = x*y, x+y
            dn = abs(num - t*den)
            if bn is None or dn*bd < bn*den: bn, bd, bv1, bv2 = dn, den, x, y
    rp = int(hu(bv1*bv2, bv1+bv2))
    e = shu((rp-t)*10000, t)
    tail = "exact." if e == 0 else f"{errtext(e)} of {dec(Fraction(t))} Ω."
    return (f"Two E24 values in parallel come closest with {dec(Fraction(bv1))} Ω and {dec(Fraction(bv2))} Ω, "
            f"giving {dec(Fraction(rp))} Ω, {tail}")

random.seed(735)
cases = [
  dict(fn="nearest", args=["276"], expect=nearest_t(27600)),
  dict(fn="series", args=["276"], expect=series_t(27600)),
  dict(fn="parallel", args=["276"], expect=parallel_t(27600)),
]
for _ in range(30):
    t = random.randint(1, 10000000000)
    cases.append(dict(fn="nearest", args=[s100(t)], expect=nearest_t(t)))
    cases.append(dict(fn="series", args=[s100(t)], expect=series_t(t)))
    cases.append(dict(fn="parallel", args=[s100(t)], expect=parallel_t(t)))
errcases = [
  ("nearest", ["0"]), ("nearest", ["100000000.01"]), ("nearest", ["276.005"]),
  ("series", ["0"]), ("series", ["abc"]),
  ("parallel", ["-5"]), ("parallel", ["100000000.005"]),
]
json.dump({"cases": cases, "errors": errcases}, open("expected.json","w"), ensure_ascii=False, indent=1)
open("expected.json","a").write("\n")
print("expected.json written:", len(cases), "cases")
