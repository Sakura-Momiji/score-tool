import { stadiums } from "./data.js";
import { texts } from "./i18n.js";

let currentLang = "ja";

const el = (id) => document.getElementById(id);

// =========================
// UIテキスト反映
// =========================
function applyTexts() {
  const t = texts[currentLang];

  el("title").textContent = t.title;
  el("label-lang").textContent = t.lang;
  el("label-stadium").textContent = t.stadium;
  el("label-rank").textContent = t.rank;
  el("label-count").textContent = t.count;
  el("label-group").textContent = t.group;
  el("label-unified").textContent = t.unified;
  el("label-round").textContent = t.round;
  el("copyBtn").textContent = t.copy;

  // グループ
  const group = el("group");
  group.innerHTML = `
    <option value="none">${t.none}</option>
    <option value="1">1</option>
    <option value="2">2</option>
  `;

  // 統一
  const unified = el("unified");
  unified.innerHTML = `
    <option value="false">${t.unified_off}</option>
    <option value="true">${t.unified_on}</option>
  `;
}

// =========================
// スタジアム
// =========================
function renderStadiums() {
  const select = el("stadium");
  select.innerHTML = "";

  stadiums.forEach(s => {
    const option = document.createElement("option");
    option.value = s.id;
    option.textContent = s.name[currentLang];
    select.appendChild(option);
  });
}

// =========================
// 人数制限
// =========================
function updateMaxPlayers() {
  const selected = stadiums.find(s => s.id === el("stadium").value);
  const count = el("count");
  const rank = el("rank");

  count.max = selected.maxPlayers;
  rank.max = selected.maxPlayers;

  // 超えてたら補正
  if (parseInt(count.value) > selected.maxPlayers) {
    count.value = selected.maxPlayers;
  }

  if (parseInt(rank.value) > selected.maxPlayers) {
    rank.value = selected.maxPlayers;
  }
}

// =========================
// コマンド生成
// =========================
function generateCommand() {
  const t = texts[currentLang];

  const stadiumId = el("stadium").value;
  const stadium = el("stadium").value;
  const rank = el("rank").value;
  const count = el("count").value;
  const group = el("group").value;
  const unified = el("unified").value;
  const round = el("round").value;

  const errorEl = el("error");

  // 🔴 エラー表示

  //VS.ギガンテスの場合
    if (stadiumId === "vg") {
    if (group !== "none" || unified === "true") {
      errorEl.textContent =
        currentLang === "ja"
          ? "VS.ギガンテスではグループ・統一は使用できません"
          : "Group/Unified cannot be used in VS Gigantes";

      el("command").value = "";
      return;
    }
  }

  // 統一ありでグループなしはエラー
  if (unified === "true" && group === "none") {
    errorEl.textContent = t.error_group;
    el("command").value = "";
    return;
  }

  errorEl.textContent = "";

  let cmd = `/p stadium:${stadium} rank:${rank} count:${count}`;

  if (group !== "none") cmd += ` group:${group}`;
  if (unified === "true") cmd += ` unified:True`;

  cmd += ` round:${round}`;

  el("command").value = cmd;
}

// =========================
// コピー
// =========================
el("copyBtn").addEventListener("click", async () => {
  const t = texts[currentLang];

  try {
    await navigator.clipboard.writeText(el("command").value);
    el("copyMsg").textContent = t.copied;
    setTimeout(() => el("copyMsg").textContent = "", 1500);
  } catch {
    el("copyMsg").textContent = t.copy_fail;
  }
});

// =========================
// イベント
// =========================
[
  "stadium","rank","count","group","unified","round"
].forEach(id => {
  el(id).addEventListener("input", () => {
    updateMaxPlayers();
    generateCommand();
  });
});

// 言語切替
el("lang").addEventListener("change", (e) => {
  currentLang = e.target.value;
  applyTexts();
  renderStadiums();
  generateCommand();
});

// 初期化
applyTexts();
renderStadiums();
updateMaxPlayers();
generateCommand();