/*
 * charts for WeChat small app v1.0
 *
 * https://github.com/xiaolin3303/wx-charts
 * 2016-11-28
 *
 * Designed and built with all the love of Web
 */

"use strict";
function assign(t, e) {
  if (null == t) throw new TypeError("Cannot convert undefined or null to object");for (var i = Object(t), a = 1; a < arguments.length; a++) {
    var n = arguments[a];if (null != n) for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (i[o] = n[o]);
  }return i;
}function findRange(t, e, i) {
  if (isNaN(t)) throw new Error("[wxCharts] unvalid series data!");i = i || 10, e = e || "upper";for (var a = 1; i < 1;) i *= 10, a *= 10;for (t = "upper" === e ? Math.ceil(t * a) : Math.floor(t * a); t % i != 0;) "upper" === e ? t++ : t--;return t / a;
}function calValidDistance(t, e, i, a) {
  var n = a.width - i.padding - e.xAxisPoints[0],
      o = e.eachSpacing * a.categories.length,
      r = t;return t >= 0 ? r = 0 : Math.abs(t) >= o - n && (r = n - o), r;
}function isInAngleRange(t, e, i) {
  function a(t) {
    for (; t < 0;) t += 2 * Math.PI;for (; t > 2 * Math.PI;) t -= 2 * Math.PI;return t;
  }return t = a(t), e = a(e), i = a(i), e > i && (i += 2 * Math.PI, t < e && (t += 2 * Math.PI)), t >= e && t <= i;
}function calRotateTranslate(t, e, i) {
  var a = t,
      n = i - e,
      o = a + (i - n - a) / Math.sqrt(2);return o *= -1, { transX: o, transY: (i - n) * (Math.sqrt(2) - 1) - (i - n - a) / Math.sqrt(2) };
}function createCurveControlPoints(t, e) {
  function i(t, e) {
    return !(!t[e - 1] || !t[e + 1]) && (t[e].y >= Math.max(t[e - 1].y, t[e + 1].y) || t[e].y <= Math.min(t[e - 1].y, t[e + 1].y));
  }var a = null,
      n = null,
      o = null,
      r = null;if (e < 1 ? (a = t[0].x + .2 * (t[1].x - t[0].x), n = t[0].y + .2 * (t[1].y - t[0].y)) : (a = t[e].x + .2 * (t[e + 1].x - t[e - 1].x), n = t[e].y + .2 * (t[e + 1].y - t[e - 1].y)), e > t.length - 3) {
    var s = t.length - 1;o = t[s].x - .2 * (t[s].x - t[s - 1].x), r = t[s].y - .2 * (t[s].y - t[s - 1].y);
  } else o = t[e + 1].x - .2 * (t[e + 2].x - t[e].x), r = t[e + 1].y - .2 * (t[e + 2].y - t[e].y);return i(t, e + 1) && (r = t[e + 1].y), i(t, e) && (n = t[e].y), { ctrA: { x: a, y: n }, ctrB: { x: o, y: r } };
}function convertCoordinateOrigin(t, e, i) {
  return { x: i.x + t, y: i.y - e };
}function avoidCollision(t, e) {
  if (e) for (; util.isCollision(t, e);) t.start.x > 0 ? t.start.y-- : t.start.x < 0 ? t.start.y++ : t.start.y > 0 ? t.start.y++ : t.start.y--;return t;
}function fillSeriesColor(t, e) {
  var i = 0;return t.map(function (t) {
    return t.color || (t.color = e.colors[i], i = (i + 1) % e.colors.length), t;
  });
}function getDataRange(t, e) {
  var i = 0,
      a = e - t;return i = a >= 1e4 ? 1e3 : a >= 1e3 ? 100 : a >= 100 ? 10 : a >= 10 ? 5 : a >= 1 ? 1 : a >= .1 ? .1 : .01, { minRange: findRange(t, "lower", i), maxRange: findRange(e, "upper", i) };
}function measureText(t) {
  var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 10;t = String(t);var t = t.split(""),
      i = 0;return t.forEach(function (t) {
    /[a-zA-Z]/.test(t) ? i += 7 : /[0-9]/.test(t) ? i += 5.5 : /\./.test(t) ? i += 2.7 : /-/.test(t) ? i += 3.25 : /[\u4e00-\u9fa5]/.test(t) ? i += 10 : /\(|\)/.test(t) ? i += 3.73 : /\s/.test(t) ? i += 2.5 : /%/.test(t) ? i += 8 : i += 10;
  }), i * e / 10;
}function dataCombine(t) {
  return t.reduce(function (t, e) {
    return (t.data ? t.data : t).concat(e.data);
  }, []);
}function getSeriesDataItem(t, e) {
  var i = [];return t.forEach(function (t) {
    if (null !== t.data[e] && "undefinded" != typeof t.data[e]) {
      var a = {};a.color = t.color, a.name = t.name, a.data = t.format ? t.format(t.data[e]) : t.data[e], i.push(a);
    }
  }), i;
}function getMaxTextListLength(t) {
  var e = t.map(function (t) {
    return measureText(t);
  });return Math.max.apply(null, e);
}function getRadarCoordinateSeries(t) {
  for (var e = 2 * Math.PI / t, i = [], a = 0; a < t; a++) i.push(e * a);return i.map(function (t) {
    return -1 * t + Math.PI / 2;
  });
}function getToolTipData(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : {},
      o = t.map(function (t) {
    return { text: n.format ? n.format(t, a[i]) : t.name + ": " + t.data, color: t.color };
  }),
      r = [],
      s = { x: 0, y: 0 };return e.forEach(function (t) {
    "undefinded" != typeof t[i] && null !== t[i] && r.push(t[i]);
  }), r.forEach(function (t) {
    s.x = Math.round(t.x), s.y += t.y;
  }), s.y /= r.length, { textList: o, offset: s };
}function findCurrentIndex(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 0,
      o = -1;return isInExactChartArea(t, i, a) && e.forEach(function (e, i) {
    t.x + n > e && (o = i);
  }), o;
}function isInExactChartArea(t, e, i) {
  return t.x < e.width - i.padding && t.x > i.padding + i.yAxisWidth + i.yAxisTitleWidth && t.y > i.padding && t.y < e.height - i.legendHeight - i.xAxisHeight - i.padding;
}function findRadarChartCurrentIndex(t, e, i) {
  var a = 2 * Math.PI / i,
      n = -1;if (isInExactPieChartArea(t, e.center, e.radius)) {
    var o = function (t) {
      return t < 0 && (t += 2 * Math.PI), t > 2 * Math.PI && (t -= 2 * Math.PI), t;
    },
        r = Math.atan2(e.center.y - t.y, t.x - e.center.x);r *= -1, r < 0 && (r += 2 * Math.PI);e.angleList.map(function (t) {
      return t = o(-1 * t);
    }).forEach(function (t, e) {
      var i = o(t - a / 2),
          s = o(t + a / 2);s < i && (s += 2 * Math.PI), (r >= i && r <= s || r + 2 * Math.PI >= i && r + 2 * Math.PI <= s) && (n = e);
    });
  }return n;
}function findPieChartCurrentIndex(t, e) {
  var i = -1;if (isInExactPieChartArea(t, e.center, e.radius)) {
    var a = Math.atan2(e.center.y - t.y, t.x - e.center.x);a = -a;for (var n = 0, o = e.series.length; n < o; n++) {
      var r = e.series[n];if (isInAngleRange(a, r._start_, r._start_ + 2 * r._proportion_ * Math.PI)) {
        i = n;break;
      }
    }
  }return i;
}function isInExactPieChartArea(t, e, i) {
  return Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2) <= Math.pow(i, 2);
}function splitPoints(t) {
  var e = [],
      i = [];return t.forEach(function (t, a) {
    null !== t ? i.push(t) : (i.length && e.push(i), i = []);
  }), i.length && e.push(i), e;
}function calLegendData(t, e, i) {
  if (!1 === e.legend) return { legendList: [], legendHeight: 0 };var a = [],
      n = 0,
      o = [];return t.forEach(function (t) {
    var i = 30 + measureText(t.name || "undefinded");n + i > e.width ? (a.push(o), n = i, o = [t]) : (n += i, o.push(t));
  }), o.length && a.push(o), { legendList: a, legendHeight: a.length * (i.fontSize + 8) + 5 };
}function calCategoriesData(t, e, i) {
  var a = { angle: 0, xAxisHeight: i.xAxisHeight },
      n = getXAxisPoints(t, e, i),
      o = n.eachSpacing,
      r = t.map(function (t) {
    return measureText(t);
  }),
      s = Math.max.apply(this, r);return s + 2 * i.xAxisTextPadding > o && (a.angle = 45 * Math.PI / 180, a.xAxisHeight = 2 * i.xAxisTextPadding + s * Math.sin(a.angle)), a;
}function getRadarDataPoints(t, e, i, a, n) {
  var o = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : 1,
      r = n.extra.radar || {};r.max = r.max || 0;var s = Math.max(r.max, Math.max.apply(null, dataCombine(a))),
      l = [];return a.forEach(function (a) {
    var n = {};n.color = a.color, n.data = [], a.data.forEach(function (a, r) {
      var l = {};l.angle = t[r], l.proportion = a / s, l.position = convertCoordinateOrigin(i * l.proportion * o * Math.cos(l.angle), i * l.proportion * o * Math.sin(l.angle), e), n.data.push(l);
    }), l.push(n);
  }), l;
}function getPieDataPoints(t) {
  var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1,
      i = 0,
      a = 0;return t.forEach(function (t) {
    t.data = null === t.data ? 0 : t.data, i += t.data;
  }), t.forEach(function (t) {
    t.data = null === t.data ? 0 : t.data, t._proportion_ = t.data / i * e;
  }), t.forEach(function (t) {
    t._start_ = a, a += 2 * t._proportion_ * Math.PI;
  }), t;
}function getPieTextMaxLength(t) {
  t = getPieDataPoints(t);var e = 0;return t.forEach(function (t) {
    var i = t.format ? t.format(+t._proportion_.toFixed(2)) : util.toFixed(100 * t._proportion_) + "%";e = Math.max(e, measureText(i));
  }), e;
}function fixColumeData(t, e, i, a, n, o) {
  return t.map(function (t) {
    return null === t ? null : (t.width = (e - 2 * n.columePadding) / i, o.extra.column && o.extra.column.width && +o.extra.column.width > 0 ? t.width = Math.min(t.width, +o.extra.column.width) : t.width = Math.min(t.width, 25), t.x += (a + .5 - i / 2) * t.width, t);
  });
}function getXAxisPoints(t, e, i) {
  var a = i.yAxisWidth + i.yAxisTitleWidth,
      n = e.width - 2 * i.padding - a,
      o = e.enableScroll ? Math.min(5, t.length) : t.length,
      r = n / o,
      s = [],
      l = i.padding + a,
      h = e.width - i.padding;return t.forEach(function (t, e) {
    s.push(l + e * r);
  }), !0 === e.enableScroll ? s.push(l + t.length * r) : s.push(h), { xAxisPoints: s, startX: l, endX: h, eachSpacing: r };
}function getDataPoints(t, e, i, a, n, o, r) {
  var s = arguments.length > 7 && void 0 !== arguments[7] ? arguments[7] : 1,
      l = [],
      h = o.height - 2 * r.padding - r.xAxisHeight - r.legendHeight;return t.forEach(function (t, c) {
    if (null === t) l.push(null);else {
      var d = {};d.x = a[c] + Math.round(n / 2);var x = h * (t - e) / (i - e);x *= s, d.y = o.height - r.xAxisHeight - r.legendHeight - Math.round(x) - r.padding, l.push(d);
    }
  }), l;
}function getYAxisTextList(t, e, i) {
  var a = dataCombine(t);a = a.filter(function (t) {
    return null !== t;
  });var n = Math.min.apply(this, a),
      o = Math.max.apply(this, a);if ("number" == typeof e.yAxis.min && (n = Math.min(e.yAxis.min, n)), "number" == typeof e.yAxis.max && (o = Math.max(e.yAxis.max, o)), n === o) {
    var r = o || 1;n -= r, o += r;
  }for (var s = getDataRange(n, o), l = s.minRange, h = s.maxRange, c = [], d = (h - l) / i.yAxisSplit, x = 0; x <= i.yAxisSplit; x++) c.push(l + d * x);return c.reverse();
}function calYAxisData(t, e, i) {
  var a = getYAxisTextList(t, e, i),
      n = i.yAxisWidth,
      o = a.map(function (t) {
    return t = util.toFixed(t, 2), t = e.yAxis.format ? e.yAxis.format(Number(t)) : t, n = Math.max(n, measureText(t) + 5), t;
  });return !0 === e.yAxis.disabled && (n = 0), { rangesFormat: o, ranges: a, yAxisWidth: n };
}function drawPointShape(t, e, i, a) {
  a.beginPath(), a.setStrokeStyle("#ffffff"), a.setLineWidth(1), a.setFillStyle(e), "diamond" === i ? t.forEach(function (t, e) {
    null !== t && (a.moveTo(t.x, t.y - 4.5), a.lineTo(t.x - 4.5, t.y), a.lineTo(t.x, t.y + 4.5), a.lineTo(t.x + 4.5, t.y), a.lineTo(t.x, t.y - 4.5));
  }) : "circle" === i ? t.forEach(function (t, e) {
    null !== t && (a.moveTo(t.x + 3.5, t.y), a.arc(t.x, t.y, 4, 0, 2 * Math.PI, !1));
  }) : "rect" === i ? t.forEach(function (t, e) {
    null !== t && (a.moveTo(t.x - 3.5, t.y - 3.5), a.rect(t.x - 3.5, t.y - 3.5, 7, 7));
  }) : "triangle" === i && t.forEach(function (t, e) {
    null !== t && (a.moveTo(t.x, t.y - 4.5), a.lineTo(t.x - 4.5, t.y + 4.5), a.lineTo(t.x + 4.5, t.y + 4.5), a.lineTo(t.x, t.y - 4.5));
  }), a.closePath(), a.fill(), a.stroke();
}function drawRingTitle(t, e, i) {
  var a = t.title.fontSize || e.titleFontSize,
      n = t.subtitle.fontSize || e.subtitleFontSize,
      o = t.title.name || "",
      r = t.subtitle.name || "",
      s = t.title.color || e.titleColor,
      l = t.subtitle.color || e.subtitleColor,
      h = o ? a : 0,
      c = r ? n : 0;if (r) {
    var d = measureText(r, n),
        x = (t.width - d) / 2 + (t.subtitle.offsetX || 0),
        f = (t.height - e.legendHeight + n) / 2;o && (f -= (h + 5) / 2), i.beginPath(), i.setFontSize(n), i.setFillStyle(l), i.fillText(r, x, f), i.stroke(), i.closePath();
  }if (o) {
    var u = measureText(o, a),
        g = (t.width - u) / 2 + (t.title.offsetX || 0),
        p = (t.height - e.legendHeight + a) / 2;r && (p += (c + 5) / 2), i.beginPath(), i.setFontSize(a), i.setFillStyle(s), i.fillText(o, g, p), i.stroke(), i.closePath();
  }
}function drawPointText(t, e, i, a) {
  var n = e.data;a.beginPath(), a.setFontSize(i.fontSize), a.setFillStyle("#666666"), t.forEach(function (t, i) {
    if (null !== t) {
      var o = e.format ? e.format(n[i]) : n[i];a.fillText(o, t.x - measureText(o) / 2, t.y - 2);
    }
  }), a.closePath(), a.stroke();
}function drawRadarLabel(t, e, i, a, n, o) {
  var r = a.extra.radar || {};e += n.radarLabelTextMargin, o.beginPath(), o.setFontSize(n.fontSize), o.setFillStyle(r.labelColor || "#666666"), t.forEach(function (t, r) {
    var s = { x: e * Math.cos(t), y: e * Math.sin(t) },
        l = convertCoordinateOrigin(s.x, s.y, i),
        h = l.x,
        c = l.y;util.approximatelyEqual(s.x, 0) ? h -= measureText(a.categories[r] || "") / 2 : s.x < 0 && (h -= measureText(a.categories[r] || "")), o.fillText(a.categories[r] || "", h, c + n.fontSize / 2);
  }), o.stroke(), o.closePath();
}function drawPieText(t, e, i, a, n, o) {
  var r = n + i.pieChartLinePadding,
      s = [],
      l = null;t.map(function (t) {
    return { arc: 2 * Math.PI - (t._start_ + 2 * Math.PI * t._proportion_ / 2), text: t.format ? t.format(+t._proportion_.toFixed(2)) : util.toFixed(100 * t._proportion_) + "%", color: t.color };
  }).forEach(function (t) {
    var e = Math.cos(t.arc) * r,
        a = Math.sin(t.arc) * r,
        o = Math.cos(t.arc) * n,
        h = Math.sin(t.arc) * n,
        c = e >= 0 ? e + i.pieChartTextPadding : e - i.pieChartTextPadding,
        d = a,
        x = measureText(t.text),
        f = d;l && util.isSameXCoordinateArea(l.start, { x: c }) && (f = c > 0 ? Math.min(d, l.start.y) : e < 0 ? Math.max(d, l.start.y) : d > 0 ? Math.max(d, l.start.y) : Math.min(d, l.start.y)), c < 0 && (c -= x);var u = { lineStart: { x: o, y: h }, lineEnd: { x: e, y: a }, start: { x: c, y: f }, width: x, height: i.fontSize, text: t.text, color: t.color };l = avoidCollision(u, l), s.push(l);
  }), s.forEach(function (t) {
    var e = convertCoordinateOrigin(t.lineStart.x, t.lineStart.y, o),
        n = convertCoordinateOrigin(t.lineEnd.x, t.lineEnd.y, o),
        r = convertCoordinateOrigin(t.start.x, t.start.y, o);a.setLineWidth(1), a.setFontSize(i.fontSize), a.beginPath(), a.setStrokeStyle(t.color), a.setFillStyle(t.color), a.moveTo(e.x, e.y);var s = t.start.x < 0 ? r.x + t.width : r.x,
        l = t.start.x < 0 ? r.x - 5 : r.x + 5;a.quadraticCurveTo(n.x, n.y, s, r.y), a.moveTo(e.x, e.y), a.stroke(), a.closePath(), a.beginPath(), a.moveTo(r.x + t.width, r.y), a.arc(s, r.y, 2, 0, 2 * Math.PI), a.closePath(), a.fill(), a.beginPath(), a.setFillStyle("#666666"), a.fillText(t.text, l, r.y + 3), a.closePath(), a.stroke(), a.closePath();
  });
}function drawToolTipSplitLine(t, e, i, a) {
  var n = i.padding,
      o = e.height - i.padding - i.xAxisHeight - i.legendHeight;a.beginPath(), a.setStrokeStyle("#cccccc"), a.setLineWidth(1), a.moveTo(t, n), a.lineTo(t, o), a.stroke(), a.closePath();
}function drawToolTip(t, e, i, a, n) {
  var o = !1;e = assign({ x: 0, y: 0 }, e), e.y -= 8;var r = t.map(function (t) {
    return measureText(t.text);
  }),
      s = 9 + 4 * a.toolTipPadding + Math.max.apply(null, r),
      l = 2 * a.toolTipPadding + t.length * a.toolTipLineHeight;e.x - Math.abs(i._scrollDistance_) + 8 + s > i.width && (o = !0), n.beginPath(), n.setFillStyle(i.tooltip.option.background || a.toolTipBackground), n.setGlobalAlpha(a.toolTipOpacity), o ? (n.moveTo(e.x, e.y + 10), n.lineTo(e.x - 8, e.y + 10 - 5), n.lineTo(e.x - 8, e.y + 10 + 5), n.moveTo(e.x, e.y + 10), n.fillRect(e.x - s - 8, e.y, s, l)) : (n.moveTo(e.x, e.y + 10), n.lineTo(e.x + 8, e.y + 10 - 5), n.lineTo(e.x + 8, e.y + 10 + 5), n.moveTo(e.x, e.y + 10), n.fillRect(e.x + 8, e.y, s, l)), n.closePath(), n.fill(), n.setGlobalAlpha(1), t.forEach(function (t, i) {
    n.beginPath(), n.setFillStyle(t.color);var r = e.x + 8 + 2 * a.toolTipPadding,
        l = e.y + (a.toolTipLineHeight - a.fontSize) / 2 + a.toolTipLineHeight * i + a.toolTipPadding;o && (r = e.x - s - 8 + 2 * a.toolTipPadding), n.fillRect(r, l, 4, a.fontSize), n.closePath();
  }), n.beginPath(), n.setFontSize(a.fontSize), n.setFillStyle("#ffffff"), t.forEach(function (t, i) {
    var r = e.x + 8 + 2 * a.toolTipPadding + 4 + 5;o && (r = e.x - s - 8 + 2 * a.toolTipPadding + 4 + 5);var l = e.y + (a.toolTipLineHeight - a.fontSize) / 2 + a.toolTipLineHeight * i + a.toolTipPadding;n.fillText(t.text, r, l + a.fontSize);
  }), n.stroke(), n.closePath();
}function drawYAxisTitle(t, e, i, a) {
  var n = i.xAxisHeight + (e.height - i.xAxisHeight - measureText(t)) / 2;a.save(), a.beginPath(), a.setFontSize(i.fontSize), a.setFillStyle(e.yAxis.titleFontColor || "#333333"), a.translate(0, e.height), a.rotate(-90 * Math.PI / 180), a.fillText(t, n, i.padding + .5 * i.fontSize), a.stroke(), a.closePath(), a.restore();
}function drawColumnDataPoints(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1,
      o = calYAxisData(t, e, i),
      r = o.ranges,
      s = getXAxisPoints(e.categories, e, i),
      l = s.xAxisPoints,
      h = s.eachSpacing,
      c = r.pop(),
      d = r.shift();return a.save(), e._scrollDistance_ && 0 !== e._scrollDistance_ && !0 === e.enableScroll && a.translate(e._scrollDistance_, 0), t.forEach(function (o, r) {
    var s = o.data,
        x = getDataPoints(s, c, d, l, h, e, i, n);x = fixColumeData(x, h, t.length, r, i, e), a.beginPath(), a.setFillStyle(o.color), x.forEach(function (t, n) {
      if (null !== t) {
        var o = t.x - t.width / 2 + 1,
            r = e.height - t.y - i.padding - i.xAxisHeight - i.legendHeight;a.moveTo(o, t.y), a.rect(o, t.y, t.width - 2, r);
      }
    }), a.closePath(), a.fill();
  }), t.forEach(function (o, r) {
    var s = o.data,
        x = getDataPoints(s, c, d, l, h, e, i, n);x = fixColumeData(x, h, t.length, r, i, e), !1 !== e.dataLabel && 1 === n && drawPointText(x, o, i, a);
  }), a.restore(), { xAxisPoints: l, eachSpacing: h };
}function drawAreaDataPoints(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1,
      o = calYAxisData(t, e, i),
      r = o.ranges,
      s = getXAxisPoints(e.categories, e, i),
      l = s.xAxisPoints,
      h = s.eachSpacing,
      c = r.pop(),
      d = r.shift(),
      x = e.height - i.padding - i.xAxisHeight - i.legendHeight,
      f = [];return a.save(), e._scrollDistance_ && 0 !== e._scrollDistance_ && !0 === e.enableScroll && a.translate(e._scrollDistance_, 0), e.tooltip && e.tooltip.textList && e.tooltip.textList.length && 1 === n && drawToolTipSplitLine(e.tooltip.offset.x, e, i, a), t.forEach(function (t, o) {
    var r = t.data,
        s = getDataPoints(r, c, d, l, h, e, i, n);if (f.push(s), splitPoints(s).forEach(function (i) {
      if (a.beginPath(), a.setStrokeStyle(t.color), a.setFillStyle(t.color), a.setGlobalAlpha(.6), a.setLineWidth(2), i.length > 1) {
        var n = i[0],
            o = i[i.length - 1];a.moveTo(n.x, n.y), "curve" === e.extra.lineStyle ? i.forEach(function (t, e) {
          if (e > 0) {
            var n = createCurveControlPoints(i, e - 1);a.bezierCurveTo(n.ctrA.x, n.ctrA.y, n.ctrB.x, n.ctrB.y, t.x, t.y);
          }
        }) : i.forEach(function (t, e) {
          e > 0 && a.lineTo(t.x, t.y);
        }), a.lineTo(o.x, x), a.lineTo(n.x, x), a.lineTo(n.x, n.y);
      } else {
        var r = i[0];a.moveTo(r.x - h / 2, r.y), a.lineTo(r.x + h / 2, r.y), a.lineTo(r.x + h / 2, x), a.lineTo(r.x - h / 2, x), a.moveTo(r.x - h / 2, r.y);
      }a.closePath(), a.fill(), a.setGlobalAlpha(1);
    }), !1 !== e.dataPointShape) {
      var u = i.dataPointShape[o % i.dataPointShape.length];drawPointShape(s, t.color, u, a);
    }
  }), !1 !== e.dataLabel && 1 === n && t.forEach(function (t, o) {
    drawPointText(getDataPoints(t.data, c, d, l, h, e, i, n), t, i, a);
  }), a.restore(), { xAxisPoints: l, calPoints: f, eachSpacing: h };
}function drawLineDataPoints(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1,
      o = calYAxisData(t, e, i),
      r = o.ranges,
      s = getXAxisPoints(e.categories, e, i),
      l = s.xAxisPoints,
      h = s.eachSpacing,
      c = r.pop(),
      d = r.shift(),
      x = [];return a.save(), e._scrollDistance_ && 0 !== e._scrollDistance_ && !0 === e.enableScroll && a.translate(e._scrollDistance_, 0), e.tooltip && e.tooltip.textList && e.tooltip.textList.length && 1 === n && drawToolTipSplitLine(e.tooltip.offset.x, e, i, a), t.forEach(function (t, o) {
    var r = t.data,
        s = getDataPoints(r, c, d, l, h, e, i, n);if (x.push(s), splitPoints(s).forEach(function (i, n) {
      a.beginPath(), a.setStrokeStyle(t.color), a.setLineWidth(2), 1 === i.length ? (a.moveTo(i[0].x, i[0].y), a.arc(i[0].x, i[0].y, 1, 0, 2 * Math.PI)) : (a.moveTo(i[0].x, i[0].y), "curve" === e.extra.lineStyle ? i.forEach(function (t, e) {
        if (e > 0) {
          var n = createCurveControlPoints(i, e - 1);a.bezierCurveTo(n.ctrA.x, n.ctrA.y, n.ctrB.x, n.ctrB.y, t.x, t.y);
        }
      }) : i.forEach(function (t, e) {
        e > 0 && a.lineTo(t.x, t.y);
      }), a.moveTo(i[0].x, i[0].y)), a.closePath(), a.stroke();
    }), !1 !== e.dataPointShape) {
      var f = i.dataPointShape[o % i.dataPointShape.length];drawPointShape(s, t.color, f, a);
    }
  }), !1 !== e.dataLabel && 1 === n && t.forEach(function (t, o) {
    drawPointText(getDataPoints(t.data, c, d, l, h, e, i, n), t, i, a);
  }), a.restore(), { xAxisPoints: l, calPoints: x, eachSpacing: h };
}function drawToolTipBridge(t, e, i, a) {
  i.save(), t._scrollDistance_ && 0 !== t._scrollDistance_ && !0 === t.enableScroll && i.translate(t._scrollDistance_, 0), t.tooltip && t.tooltip.textList && t.tooltip.textList.length && 1 === a && drawToolTip(t.tooltip.textList, t.tooltip.offset, t, e, i), i.restore();
}function drawXAxis(t, e, i, a) {
  var n = getXAxisPoints(t, e, i),
      o = n.xAxisPoints,
      r = (n.startX, n.endX, n.eachSpacing),
      s = e.height - i.padding - i.xAxisHeight - i.legendHeight,
      l = s + i.xAxisLineHeight;a.save(), e._scrollDistance_ && 0 !== e._scrollDistance_ && a.translate(e._scrollDistance_, 0), a.beginPath(), a.setStrokeStyle(e.xAxis.gridColor || "#cccccc"), !0 !== e.xAxis.disableGrid && ("calibration" === e.xAxis.type ? o.forEach(function (t, e) {
    e > 0 && (a.moveTo(t - r / 2, s), a.lineTo(t - r / 2, s + 4));
  }) : o.forEach(function (t, e) {
    a.moveTo(t, s), a.lineTo(t, l);
  })), a.closePath(), a.stroke();var h = e.width - 2 * i.padding - i.yAxisWidth - i.yAxisTitleWidth,
      c = Math.min(t.length, Math.ceil(h / i.fontSize / 1.5)),
      d = Math.ceil(t.length / c);t = t.map(function (t, e) {
    return e % d != 0 ? "" : t;
  }), 0 === i._xAxisTextAngle_ ? (a.beginPath(), a.setFontSize(i.fontSize), a.setFillStyle(e.xAxis.fontColor || "#666666"), t.forEach(function (t, e) {
    var n = r / 2 - measureText(t) / 2;a.fillText(t, o[e] + n, s + i.fontSize + 5);
  }), a.closePath(), a.stroke()) : t.forEach(function (t, n) {
    a.save(), a.beginPath(), a.setFontSize(i.fontSize), a.setFillStyle(e.xAxis.fontColor || "#666666");var l = measureText(t),
        h = r / 2 - l,
        c = calRotateTranslate(o[n] + r / 2, s + i.fontSize / 2 + 5, e.height),
        d = c.transX,
        x = c.transY;a.rotate(-1 * i._xAxisTextAngle_), a.translate(d, x), a.fillText(t, o[n] + h, s + i.fontSize + 5), a.closePath(), a.stroke(), a.restore();
  }), a.restore();
}function drawYAxisGrid(t, e, i) {
  for (var a = t.height - 2 * e.padding - e.xAxisHeight - e.legendHeight, n = Math.floor(a / e.yAxisSplit), o = e.yAxisWidth + e.yAxisTitleWidth, r = e.padding + o, s = t.width - e.padding, l = [], h = 0; h < e.yAxisSplit; h++) l.push(e.padding + n * h);l.push(e.padding + n * e.yAxisSplit + 2), i.beginPath(), i.setStrokeStyle(t.yAxis.gridColor || "#cccccc"), i.setLineWidth(1), l.forEach(function (t, e) {
    i.moveTo(r, t), i.lineTo(s, t);
  }), i.closePath(), i.stroke();
}function drawYAxis(t, e, i, a) {
  if (!0 !== e.yAxis.disabled) {
    var n = calYAxisData(t, e, i),
        o = n.rangesFormat,
        r = i.yAxisWidth + i.yAxisTitleWidth,
        s = e.height - 2 * i.padding - i.xAxisHeight - i.legendHeight,
        l = Math.floor(s / i.yAxisSplit),
        h = i.padding + r,
        c = e.width - i.padding,
        d = e.height - i.padding - i.xAxisHeight - i.legendHeight;a.setFillStyle(e.background || "#ffffff"), e._scrollDistance_ < 0 && a.fillRect(0, 0, h, d + i.xAxisHeight + 5), a.fillRect(c, 0, e.width, d + i.xAxisHeight + 5);for (var x = [], f = 0; f <= i.yAxisSplit; f++) x.push(i.padding + l * f);a.stroke(), a.beginPath(), a.setFontSize(i.fontSize), a.setFillStyle(e.yAxis.fontColor || "#666666"), o.forEach(function (t, e) {
      var n = x[e] ? x[e] : d;a.fillText(t, i.padding + i.yAxisTitleWidth, n + i.fontSize / 2);
    }), a.closePath(), a.stroke(), e.yAxis.title && drawYAxisTitle(e.yAxis.title, e, i, a);
  }
}function drawLegend(t, e, i, a) {
  if (e.legend) {
    var n = calLegendData(t, e, i),
        o = n.legendList;o.forEach(function (t, n) {
      var o = 0;t.forEach(function (t) {
        t.name = t.name || "undefined", o += 15 + measureText(t.name) + 15;
      });var r = (e.width - o) / 2 + 5,
          s = e.height - i.padding - i.legendHeight + n * (i.fontSize + 8) + 5 + 8;a.setFontSize(i.fontSize), t.forEach(function (t) {
        switch (e.type) {case "line":
            a.beginPath(), a.setLineWidth(1), a.setStrokeStyle(t.color), a.moveTo(r - 2, s + 5), a.lineTo(r + 17, s + 5), a.stroke(), a.closePath(), a.beginPath(), a.setLineWidth(1), a.setStrokeStyle("#ffffff"), a.setFillStyle(t.color), a.moveTo(r + 7.5, s + 5), a.arc(r + 7.5, s + 5, 4, 0, 2 * Math.PI), a.fill(), a.stroke(), a.closePath();break;case "pie":case "ring":
            a.beginPath(), a.setFillStyle(t.color), a.moveTo(r + 7.5, s + 5), a.arc(r + 7.5, s + 5, 7, 0, 2 * Math.PI), a.closePath(), a.fill();break;default:
            a.beginPath(), a.setFillStyle(t.color), a.moveTo(r, s), a.rect(r, s, 15, 10), a.closePath(), a.fill();}r += 20, a.beginPath(), a.setFillStyle(e.extra.legendTextColor || "#333333"), a.fillText(t.name, r, s + 9), a.closePath(), a.stroke(), r += measureText(t.name) + 10;
      });
    });
  }
}function drawPieDataPoints(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1,
      o = e.extra.pie || {};t = getPieDataPoints(t, n);var r = { x: e.width / 2, y: (e.height - i.legendHeight) / 2 },
      s = Math.min(r.x - i.pieChartLinePadding - i.pieChartTextPadding - i._pieTextMaxLength_, r.y - i.pieChartLinePadding - i.pieChartTextPadding);if (e.dataLabel ? s -= 10 : s -= 2 * i.padding, t = t.map(function (t) {
    return t._start_ += (o.offsetAngle || 0) * Math.PI / 180, t;
  }), t.forEach(function (t) {
    a.beginPath(), a.setLineWidth(2), a.setStrokeStyle("#ffffff"), a.setFillStyle(t.color), a.moveTo(r.x, r.y), a.arc(r.x, r.y, s, t._start_, t._start_ + 2 * t._proportion_ * Math.PI), a.closePath(), a.fill(), !0 !== e.disablePieStroke && a.stroke();
  }), "ring" === e.type) {
    var l = .6 * s;"number" == typeof e.extra.ringWidth && e.extra.ringWidth > 0 && (l = Math.max(0, s - e.extra.ringWidth)), a.beginPath(), a.setFillStyle(e.background || "#ffffff"), a.moveTo(r.x, r.y), a.arc(r.x, r.y, l, 0, 2 * Math.PI), a.closePath(), a.fill();
  }if (!1 !== e.dataLabel && 1 === n) {
    for (var h = !1, c = 0, d = t.length; c < d; c++) if (t[c].data > 0) {
      h = !0;break;
    }h && drawPieText(t, e, i, a, s, r);
  }return 1 === n && "ring" === e.type && drawRingTitle(e, i, a), { center: r, radius: s, series: t };
}function drawRadarDataPoints(t, e, i, a) {
  var n = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 1,
      o = e.extra.radar || {},
      r = getRadarCoordinateSeries(e.categories.length),
      s = { x: e.width / 2, y: (e.height - i.legendHeight) / 2 },
      l = Math.min(s.x - (getMaxTextListLength(e.categories) + i.radarLabelTextMargin), s.y - i.radarLabelTextMargin);l -= i.padding, a.beginPath(), a.setLineWidth(1), a.setStrokeStyle(o.gridColor || "#cccccc"), r.forEach(function (t) {
    var e = convertCoordinateOrigin(l * Math.cos(t), l * Math.sin(t), s);a.moveTo(s.x, s.y), a.lineTo(e.x, e.y);
  }), a.stroke(), a.closePath();for (var h = 1; h <= i.radarGridCount; h++) !function (t) {
    var e = {};a.beginPath(), a.setLineWidth(1), a.setStrokeStyle(o.gridColor || "#cccccc"), r.forEach(function (n, o) {
      var r = convertCoordinateOrigin(l / i.radarGridCount * t * Math.cos(n), l / i.radarGridCount * t * Math.sin(n), s);0 === o ? (e = r, a.moveTo(r.x, r.y)) : a.lineTo(r.x, r.y);
    }), a.lineTo(e.x, e.y), a.stroke(), a.closePath();
  }(h);return getRadarDataPoints(r, s, l, t, e, n).forEach(function (t, n) {
    if (a.beginPath(), a.setFillStyle(t.color), a.setGlobalAlpha(.6), t.data.forEach(function (t, e) {
      0 === e ? a.moveTo(t.position.x, t.position.y) : a.lineTo(t.position.x, t.position.y);
    }), a.closePath(), a.fill(), a.setGlobalAlpha(1), !1 !== e.dataPointShape) {
      var o = i.dataPointShape[n % i.dataPointShape.length];drawPointShape(t.data.map(function (t) {
        return t.position;
      }), t.color, o, a);
    }
  }), drawRadarLabel(r, l, s, e, i, a), { center: s, radius: l, angleList: r };
}function drawCanvas(t, e) {
  e.draw();
}function Animation(t) {
  this.isStop = !1, t.duration = void 0 === t.duration ? 1e3 : t.duration, t.timing = t.timing || "linear";var e = function () {
    return "undefined" != typeof requestAnimationFrame ? requestAnimationFrame : "undefined" != typeof setTimeout ? function (t, e) {
      setTimeout(function () {
        var e = +new Date();t(e);
      }, e);
    } : function (t) {
      t(null);
    };
  }(),
      i = null,
      a = function (n) {
    if (null === n || !0 === this.isStop) return t.onProcess && t.onProcess(1), void (t.onAnimationFinish && t.onAnimationFinish());if (null === i && (i = n), n - i < t.duration) {
      var o = (n - i) / t.duration;o = (0, Timing[t.timing])(o), t.onProcess && t.onProcess(o), e(a, 17);
    } else t.onProcess && t.onProcess(1), t.onAnimationFinish && t.onAnimationFinish();
  };a = a.bind(this), e(a, 17);
}function drawCharts(t, e, i, a) {
  var n = this,
      o = e.series,
      r = e.categories;o = fillSeriesColor(o, i);var s = calLegendData(o, e, i),
      l = s.legendHeight;i.legendHeight = l;var h = calYAxisData(o, e, i),
      c = h.yAxisWidth;if (i.yAxisWidth = c, r && r.length) {
    var d = calCategoriesData(r, e, i),
        x = d.xAxisHeight,
        f = d.angle;i.xAxisHeight = x, i._xAxisTextAngle_ = f;
  }"pie" !== t && "ring" !== t || (i._pieTextMaxLength_ = !1 === e.dataLabel ? 0 : getPieTextMaxLength(o));var u = e.animation ? 1e3 : 0;switch (this.animationInstance && this.animationInstance.stop(), t) {case "line":
      this.animationInstance = new Animation({ timing: "easeIn", duration: u, onProcess: function (t) {
          drawYAxisGrid(e, i, a);var s = drawLineDataPoints(o, e, i, a, t),
              l = s.xAxisPoints,
              h = s.calPoints,
              c = s.eachSpacing;n.chartData.xAxisPoints = l, n.chartData.calPoints = h, n.chartData.eachSpacing = c, drawXAxis(r, e, i, a), drawLegend(e.series, e, i, a), drawYAxis(o, e, i, a), drawToolTipBridge(e, i, a, t), drawCanvas(e, a);
        }, onAnimationFinish: function () {
          n.event.trigger("renderComplete");
        } });break;case "column":
      this.animationInstance = new Animation({ timing: "easeIn", duration: u, onProcess: function (t) {
          drawYAxisGrid(e, i, a);var s = drawColumnDataPoints(o, e, i, a, t),
              l = s.xAxisPoints,
              h = s.eachSpacing;n.chartData.xAxisPoints = l, n.chartData.eachSpacing = h, drawXAxis(r, e, i, a), drawLegend(e.series, e, i, a), drawYAxis(o, e, i, a), drawCanvas(e, a);
        }, onAnimationFinish: function () {
          n.event.trigger("renderComplete");
        } });break;case "area":
      this.animationInstance = new Animation({ timing: "easeIn", duration: u, onProcess: function (t) {
          drawYAxisGrid(e, i, a);var s = drawAreaDataPoints(o, e, i, a, t),
              l = s.xAxisPoints,
              h = s.calPoints,
              c = s.eachSpacing;n.chartData.xAxisPoints = l, n.chartData.calPoints = h, n.chartData.eachSpacing = c, drawXAxis(r, e, i, a), drawLegend(e.series, e, i, a), drawYAxis(o, e, i, a), drawToolTipBridge(e, i, a, t), drawCanvas(e, a);
        }, onAnimationFinish: function () {
          n.event.trigger("renderComplete");
        } });break;case "ring":case "pie":
      this.animationInstance = new Animation({ timing: "easeInOut", duration: u, onProcess: function (t) {
          n.chartData.pieData = drawPieDataPoints(o, e, i, a, t), drawLegend(e.series, e, i, a), drawCanvas(e, a);
        }, onAnimationFinish: function () {
          n.event.trigger("renderComplete");
        } });break;case "radar":
      this.animationInstance = new Animation({ timing: "easeInOut", duration: u, onProcess: function (t) {
          n.chartData.radarData = drawRadarDataPoints(o, e, i, a, t), drawLegend(e.series, e, i, a), drawCanvas(e, a);
        }, onAnimationFinish: function () {
          n.event.trigger("renderComplete");
        } });}
}function Event() {
  this.events = {};
}var config = { yAxisWidth: 15, yAxisSplit: 5, xAxisHeight: 15, xAxisLineHeight: 15, legendHeight: 15, yAxisTitleWidth: 15, padding: 12, columePadding: 3, fontSize: 10, dataPointShape: ["diamond", "circle", "triangle", "rect"], colors: ["#7cb5ec", "#f7a35c", "#434348", "#90ed7d", "#f15c80", "#8085e9"], pieChartLinePadding: 25, pieChartTextPadding: 15, xAxisTextPadding: 3, titleColor: "#333333", titleFontSize: 20, subtitleColor: "#999999", subtitleFontSize: 15, toolTipPadding: 3, toolTipBackground: "#000000", toolTipOpacity: .7, toolTipLineHeight: 14, radarGridCount: 3, radarLabelTextMargin: 15 },
    util = { toFixed: function (t, e) {
    return e = e || 2, this.isFloat(t) && (t = t.toFixed(e)), t;
  }, isFloat: function (t) {
    return t % 1 != 0;
  }, approximatelyEqual: function (t, e) {
    return Math.abs(t - e) < 1e-10;
  }, isSameSign: function (t, e) {
    return Math.abs(t) === t && Math.abs(e) === e || Math.abs(t) !== t && Math.abs(e) !== e;
  }, isSameXCoordinateArea: function (t, e) {
    return this.isSameSign(t.x, e.x);
  }, isCollision: function (t, e) {
    return t.end = {}, t.end.x = t.start.x + t.width, t.end.y = t.start.y - t.height, e.end = {}, e.end.x = e.start.x + e.width, e.end.y = e.start.y - e.height, !(e.start.x > t.end.x || e.end.x < t.start.x || e.end.y > t.start.y || e.start.y < t.end.y);
  } },
    Timing = { easeIn: function (t) {
    return Math.pow(t, 3);
  }, easeOut: function (t) {
    return Math.pow(t - 1, 3) + 1;
  }, easeInOut: function (t) {
    return (t /= .5) < 1 ? .5 * Math.pow(t, 3) : .5 * (Math.pow(t - 2, 3) + 2);
  }, linear: function (t) {
    return t;
  } };Animation.prototype.stop = function () {
  this.isStop = !0;
}, Event.prototype.addEventListener = function (t, e) {
  this.events[t] = this.events[t] || [], this.events[t].push(e);
}, Event.prototype.trigger = function () {
  for (var t = arguments.length, e = Array(t), i = 0; i < t; i++) e[i] = arguments[i];var a = e[0],
      n = e.slice(1);this.events[a] && this.events[a].forEach(function (t) {
    try {
      t.apply(null, n);
    } catch (t) {
      console.error(t);
    }
  });
};var Charts = function (t) {
  t.title = t.title || {}, t.subtitle = t.subtitle || {}, t.yAxis = t.yAxis || {}, t.xAxis = t.xAxis || {}, t.extra = t.extra || {}, t.legend = !1 !== t.legend, t.animation = !1 !== t.animation;var e = assign({}, config);e.yAxisTitleWidth = !0 !== t.yAxis.disabled && t.yAxis.title ? e.yAxisTitleWidth : 0, e.pieChartLinePadding = !1 === t.dataLabel ? 0 : e.pieChartLinePadding, e.pieChartTextPadding = !1 === t.dataLabel ? 0 : e.pieChartTextPadding, this.opts = t, this.config = e, this.context = swan.createCanvasContext(t.canvasId), this.chartData = {}, this.event = new Event(), this.scrollOption = { currentOffset: 0, startTouchX: 0, distance: 0 }, drawCharts.call(this, t.type, t, e, this.context);
};Charts.prototype.updateData = function () {
  var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};this.opts.series = t.series || this.opts.series, this.opts.categories = t.categories || this.opts.categories, this.opts.title = assign({}, this.opts.title, t.title || {}), this.opts.subtitle = assign({}, this.opts.subtitle, t.subtitle || {}), drawCharts.call(this, this.opts.type, this.opts, this.config, this.context);
}, Charts.prototype.stopAnimation = function () {
  this.animationInstance && this.animationInstance.stop();
}, Charts.prototype.addEventListener = function (t, e) {
  this.event.addEventListener(t, e);
}, Charts.prototype.getCurrentDataIndex = function (t) {
  var e = t.touches && t.touches.length ? t.touches : t.changedTouches;if (e && e.length) {
    var i = e[0],
        a = i.x,
        n = i.y;return "pie" === this.opts.type || "ring" === this.opts.type ? findPieChartCurrentIndex({ x: a, y: n }, this.chartData.pieData) : "radar" === this.opts.type ? findRadarChartCurrentIndex({ x: a, y: n }, this.chartData.radarData, this.opts.categories.length) : findCurrentIndex({ x: a, y: n }, this.chartData.xAxisPoints, this.opts, this.config, Math.abs(this.scrollOption.currentOffset));
  }return -1;
}, Charts.prototype.showToolTip = function (t) {
  var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};if ("line" === this.opts.type || "area" === this.opts.type) {
    var i = this.getCurrentDataIndex(t),
        a = this.scrollOption.currentOffset,
        n = assign({}, this.opts, { _scrollDistance_: a, animation: !1 });if (i > -1) {
      var o = getSeriesDataItem(this.opts.series, i);if (0 === o.length) drawCharts.call(this, n.type, n, this.config, this.context);else {
        var r = getToolTipData(o, this.chartData.calPoints, i, this.opts.categories, e),
            s = r.textList,
            l = r.offset;n.tooltip = { textList: s, offset: l, option: e }, drawCharts.call(this, n.type, n, this.config, this.context);
      }
    } else drawCharts.call(this, n.type, n, this.config, this.context);
  }
}, Charts.prototype.scrollStart = function (t) {
  t.touches[0] && !0 === this.opts.enableScroll && (this.scrollOption.startTouchX = t.touches[0].x);
}, Charts.prototype.scroll = function (t) {
  if (t.touches[0] && !0 === this.opts.enableScroll) {
    var e = t.touches[0].x - this.scrollOption.startTouchX,
        i = this.scrollOption.currentOffset,
        a = calValidDistance(i + e, this.chartData, this.config, this.opts);this.scrollOption.distance = e = a - i;var n = assign({}, this.opts, { _scrollDistance_: i + e, animation: !1 });drawCharts.call(this, n.type, n, this.config, this.context);
  }
}, Charts.prototype.scrollEnd = function (t) {
  if (!0 === this.opts.enableScroll) {
    var e = this.scrollOption,
        i = e.currentOffset,
        a = e.distance;this.scrollOption.currentOffset = i + a, this.scrollOption.distance = 0;
  }
}, module.exports = Charts;