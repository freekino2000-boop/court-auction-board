/**
 * 경매 현황 위젯 — 기사 본문에 끼워 쓴다.
 *
 *   <div id="auction-widget"></div>
 *   <script src="https://freekino2000-boop.github.io/court-auction-board/widget.js"></script>
 *
 * iframe 과 달리 기사 폰트와 배경을 그대로 물려받고, 높이가 내용에 맞게 늘어난다.
 * 데이터는 같은 곳의 data.json 을 읽는다(하루 두 차례 갱신).
 */
(function () {
  var BASE = "https://freekino2000-boop.github.io/court-auction-board/";
  var el = document.getElementById("auction-widget");
  if (!el) return;

  var C = { "주거용건물": "#eb6834", "상가용건물": "#eda100", "산업용건물": "#4a3aa7",
            "토지": "#2a78d6", "임야": "#1baf7a", "자동차": "#e34948", "기타": "#8e8e99" };
  var won = function (n) { return (n || 0).toLocaleString("ko-KR"); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  };

  el.innerHTML = '<p style="color:#6b7b86;font-size:.95em;margin:1em 0">경매 현황을 불러오는 중…</p>';

  fetch(BASE + "data.json?v=" + Date.now(), { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (d) { draw(d); })
    .catch(function (e) {
      el.innerHTML = '<p style="color:#6b7b86;font-size:.95em">현황을 불러오지 못했습니다 (' +
        esc(e.message) + '). <a href="' + BASE + '" target="_blank" rel="noopener">현황판에서 보기</a></p>';
    });

  function draw(d) {
    var rows = d.물건 || [];
    var cat = {}, sido = {};
    var appr = 0, rate = 0, rated = 0, fail2 = 0;
    rows.forEach(function (r) {
      cat[r.카테고리] = (cat[r.카테고리] || 0) + 1;
      var s = r.시도 || "미상";
      sido[s] = (sido[s] || 0) + 1;
      appr += r.감정가 || 0;
      if (r.최저가율) { rate += r.최저가율; rated++; }
      if ((r.유찰 || 0) >= 2) fail2++;
    });
    var sortDesc = function (o) {
      return Object.keys(o).map(function (k) { return [k, o[k]]; })
        .sort(function (a, b) { return b[1] - a[1]; });
    };
    var cats = sortDesc(cat), sidos = sortDesc(sido);
    var total = rows.length;
    var avg = rated ? Math.round(rate / rated) : 0;
    var eok = appr >= 1e12 ? (appr / 1e12).toFixed(1) + "조원" : Math.round(appr / 1e8).toLocaleString() + "억원";

    var stat = function (label, value) {
      return '<div style="flex:1;min-width:104px;padding:10px 12px;background:#f2f6f9;' +
        'border:1px solid #d3dde4;border-radius:6px;text-align:center">' +
        '<div style="font-size:.8em;color:#6b7b86;margin-bottom:3px">' + label + '</div>' +
        '<div style="font-size:1.25em;font-weight:700;color:#0b3d5c">' + value + '</div></div>';
    };

    var bar = function (list, colored) {
      var max = list[0][1] || 1;
      return list.map(function (kv) {
        var color = colored ? (C[kv[0]] || "#8e8e99") : "#0b3d5c";
        return '<div style="margin:0 0 7px">' +
          '<div style="display:flex;justify-content:space-between;font-size:.88em;margin-bottom:3px">' +
          '<span>' + esc(kv[0]) + '</span><strong>' + won(kv[1]) + '</strong></div>' +
          '<div style="height:6px;background:#e6ecf0;border-radius:99px;overflow:hidden">' +
          '<div style="height:100%;width:' + (kv[1] / max * 100).toFixed(1) + '%;background:' + color +
          ';border-radius:99px"></div></div></div>';
      }).join("");
    };

    el.innerHTML =
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:1em 0">' +
        stat("전체 물건", won(total) + "건") +
        stat("평균 최저가율", avg + "%") +
        stat("2회 이상 유찰", won(fail2) + "건") +
        stat("감정가 합계", eok) +
      '</div>' +
      '<div style="display:flex;gap:20px;flex-wrap:wrap;margin:1.2em 0">' +
        '<div style="flex:1;min-width:230px">' +
          '<div style="font-weight:700;color:#0b3d5c;margin-bottom:9px">종류별</div>' + bar(cats, true) +
        '</div>' +
        '<div style="flex:1;min-width:230px">' +
          '<div style="font-weight:700;color:#0b3d5c;margin-bottom:9px">지역별 상위 8곳</div>' +
          bar(sidos.slice(0, 8), false) +
        '</div>' +
      '</div>' +
      '<p style="font-size:.85em;color:#6b7b86;margin:.6em 0 0">기준 ' + esc(d.수집시각) +
      ' · 대법원 법원경매정보 · <a href="' + BASE + '" target="_blank" rel="noopener">전체 현황판 열기</a></p>';
  }
})();
