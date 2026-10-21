// E-Series Math engine: nearest standard E24/E96 value to a target, the closest E24 series pair, and the closest E24 parallel pair, each with the signed error against the target. Exact integers (hundredths of an Ω, hundredths of a %), BigInt for the parallel cross-products, half-up on display only.
function _p(t, err, intDigits, places, lo, hi) {
  t = typeof t === "string" ? t.trim() : "";
  var m = new RegExp("^([0-9]{1," + intDigits + "})(?:\\.([0-9]{1," + places + "}))?$").exec(t);
  if (!m) throw new Error(err);
  var v = parseInt(m[1], 10) * Math.pow(10, places) + (m[2] ? parseInt(m[2].padEnd(places, "0"), 10) : 0);
  if (v < lo || v > hi) throw new Error(err);
  return v;
}
var _R = "the target must be from 0.01 to 100000000 Ω with at most two decimal places";
function _hu(n, d) { return Math.floor((2 * n + d) / (2 * d)); }
function _shu(n, d) { return n < 0 ? -_hu(-n, d) : _hu(n, d); }
function _huB(n, d) { return Number((2n * n + d) / (2n * d)); }
function _dec(v, places) {
  if (v < 0) return "-" + _dec(-v, places);
  var base = Math.pow(10, places);
  var s = String(Math.floor(v / base)), f = String(v % base).padStart(places, "0").replace(/0+$/, "");
  return f ? s + "." + f : s;
}
var E24B = [10,11,12,13,15,16,18,20,22,24,27,30,33,36,39,43,47,51,56,62,68,75,82,91];
var E96B = [100,102,105,107,110,113,115,118,121,124,127,130,133,137,140,143,147,150,154,158,162,165,169,174,178,182,187,191,196,200,205,210,215,221,226,232,237,243,249,255,261,267,274,280,287,294,301,309,316,324,332,340,348,357,365,374,383,392,402,412,422,432,442,453,464,475,487,499,511,523,536,549,562,576,590,604,619,634,649,665,681,698,715,732,750,768,787,806,825,845,866,887,909,931,953,976];
function _e24() { var a=[]; for (var d=0; d<7; d++) for (var i=0; i<E24B.length; i++) a.push(E24B[i]*Math.pow(10,d+1)); return a; }
function _e96() { var a=[]; for (var d=0; d<7; d++) for (var i=0; i<E96B.length; i++) a.push(E96B[i]*Math.pow(10,d)); return a; }
var _V24 = _e24(), _V96 = _e96();
function _errText(e) { if (e === 0) return "exact"; return e < 0 ? _dec(-e, 2) + " % low" : _dec(e, 2) + " % high"; }
function _nearest(vals, x) {
  var best = vals[0], bd = Math.abs(x - vals[0]);
  for (var i = 1; i < vals.length; i++) { var dd = Math.abs(x - vals[i]); if (dd < bd) { bd = dd; best = vals[i]; } }
  return best;
}
function _target(t) { return _p(t, _R, 9, 2, 1, 10000000000); }

function nearestTruth(target) {
  var t = _target(target);
  var a = _nearest(_V24, t), b = _nearest(_V96, t);
  var ea = _shu((a - t) * 10000, t), eb = _shu((b - t) * 10000, t);
  return "The nearest E24 value to " + _dec(t, 2) + " Ω is " + _dec(a, 2) + " Ω, " + _errText(ea) + "; the nearest E96 is " + _dec(b, 2) + " Ω, " + _errText(eb) + ".";
}
function seriesTruth(target) {
  var t = _target(target);
  var bv1 = 0, bv2 = 0, bsum = 0, bdiff = -1;
  for (var i = 0; i < _V24.length; i++) {
    var v1 = _V24[i], rem = t - v1;
    var v2 = rem <= _V24[0] ? _V24[0] : _nearest(_V24, rem);
    var sum = v1 + v2, diff = Math.abs(sum - t);
    if (bdiff < 0 || diff < bdiff) { bdiff = diff; bv1 = v1; bv2 = v2; bsum = sum; }
  }
  var e = _shu((bsum - t) * 10000, t);
  var tail = e === 0 ? "exact." : _errText(e) + " of " + _dec(t, 2) + " Ω.";
  return "Two E24 values in series come closest with " + _dec(bv1, 2) + " Ω + " + _dec(bv2, 2) + " Ω, landing at " + _dec(bsum, 2) + " Ω, " + tail;
}
function parallelTruth(target) {
  var t = _target(target);
  var T = BigInt(t), bn = null, bd = null, bv1 = 0, bv2 = 0;
  for (var i = 0; i < _V24.length; i++) for (var j = i; j < _V24.length; j++) {
    var v1 = BigInt(_V24[i]), v2 = BigInt(_V24[j]);
    var num = v1 * v2, den = v1 + v2;
    var dn = num > T * den ? num - T * den : T * den - num;
    if (bn === null || dn * bd < bn * den) { bn = dn; bd = den; bv1 = _V24[i]; bv2 = _V24[j]; }
  }
  var rp = _huB(BigInt(bv1) * BigInt(bv2), BigInt(bv1 + bv2));
  var e = _shu((rp - t) * 10000, t);
  var tail = e === 0 ? "exact." : _errText(e) + " of " + _dec(t, 2) + " Ω.";
  return "Two E24 values in parallel come closest with " + _dec(bv1, 2) + " Ω and " + _dec(bv2, 2) + " Ω, giving " + _dec(rp, 2) + " Ω, " + tail;
}
