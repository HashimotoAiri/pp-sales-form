// ========= 設定 =========
// ここをあなたのGASに合わせて差し替え
const API_URL = "https://script.google.com/macros/s/AKfycbwrRW1pNNFtwDBguiEgdRZJNWXGlpLW1HeRz3OJpl5SRNCqIgCfMc_Wk1etkTC743cATA/exec";
const API_TOKEN = "ppsales_2026_Jan_9$A9fKx!";

const $ = (id) => document.getElementById(id);

function yen(v){
  const n = toNum(v);
  return "¥" + n.toLocaleString("ja-JP");
}
function toNum(v){
  if (v == null) return 0;
  const s = String(v).replace(/[^\d\-]/g, "");
  if (!s || s === "-") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function getStore(){
  const el = document.querySelector('input[name="store"]:checked');
  return el ? el.value : "";
}

function setSelectedRowUI(){
  document.querySelectorAll(".radioRow").forEach(row => row.classList.remove("isSelected"));
  const checked = document.querySelector('input[name="store"]:checked');
  if (checked) checked.closest(".radioRow")?.classList.add("isSelected");
}

document.querySelectorAll('input[name="store"]').forEach(r => {
  r.addEventListener("change", setSelectedRowUI);
});
setSelectedRowUI();

function collect(){
  return {
    applicationType: $("applicationType").value.trim(),
    name: $("name").value.trim(),
    salesDay: $("salesDay").value.trim(),
    store: getStore(),

    transferAmount: $("transferAmount").value.trim(),
    transferDay: $("transferDay").value.trim(),
    transferTo: $("transferTo").value.trim(),

    salesCash: $("salesCash").value.trim(),
    expCash: $("expCash").value.trim(),

    salesCredit: $("salesCredit").value.trim(),
    expUpsider: $("expUpsider").value.trim(),

    salesQR: $("salesQR").value.trim(),
    expSMBC: $("expSMBC").value.trim(),

    shortageRequest: $("shortageRequest").value.trim(),
    note: $("note").value.trim(),
  };
}

function validate(d){
  if (!d.applicationType) return "申請種別を選択してください";
  if (!d.name) return "氏名（本名）を入力してください";
  if (!d.salesDay) return "売上日を入力してください";
  if (!d.store) return "売上店舗を選択してください";
  if (!d.transferAmount) return "送金額を入力してください";
  if (!d.transferDay) return "送金日を入力してください";
  if (!d.transferTo) return "送金先を選択してください";
  if (!d.salesCash) return "売上①（現金）を入力してください";
  if (!d.expCash) return "経費①（現金）を入力してください";
  if (!d.salesCredit) return "売上②（売掛/クレカ）を入力してください";
  if (!d.expUpsider) return "経費②（UPSIDER）を入力してください";
  if (!d.salesQR) return "売上③（売掛/QR）を入力してください";
  if (!d.expSMBC) return "経費③（三井住友）を入力してください";
  if (!d.note) return "備考欄を入力してください";
  return null;
}

function show(el, text, isError=false){
  el.textContent = text;
  el.classList.remove("hidden");
  if (isError) el.classList.add("msgError");
  else el.classList.remove("msgError");
}
function hide(el){
  el.classList.add("hidden");
  el.textContent = "";
}

function fillConfirm(d){
  $("c_applicationType").textContent = d.applicationType;
  $("c_name").textContent = d.name;
  $("c_salesDay").textContent = d.salesDay;
  $("c_store").textContent = d.store;

  $("c_transferAmount").textContent = yen(d.transferAmount);
  $("c_transferDay").textContent = d.transferDay;
  $("c_transferTo").textContent = d.transferTo;

  $("c_salesCash").textContent = yen(d.salesCash);
  $("c_expCash").textContent = yen(d.expCash);
  $("c_salesCredit").textContent = yen(d.salesCredit);
  $("c_expUpsider").textContent = yen(d.expUpsider);
  $("c_salesQR").textContent = yen(d.salesQR);
  $("c_expSMBC").textContent = yen(d.expSMBC);

  const shortage = toNum(d.shortageRequest);
  if (shortage > 0){
    $("c_shortageRow").style.display = "flex";
    $("c_shortageRequest").textContent = yen(shortage);
  } else {
    $("c_shortageRow").style.display = "none";
    $("c_shortageRequest").textContent = "";
  }

  $("c_note").textContent = d.note || "—";
}

function gotoConfirm(){
  const d = collect();
  const err = validate(d);
  const msg = $("inputError");
  hide(msg);
  if (err) return show(msg, err, true);

  fillConfirm(d);

  $("stepInput").classList.add("hidden");
  $("stepConfirm").classList.remove("hidden");

  // 画面トップへ（スクショ撮りやすく）
  window.scrollTo({ top: 0, behavior: "instant" });
}

function backToEdit(){
  hide($("confirmMsg"));
  $("stepConfirm").classList.add("hidden");
  $("stepInput").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
}

async function submit(){
  const d = collect();
  const err = validate(d);
  const msg = $("confirmMsg");
  hide(msg);
  if (err) return show(msg, err, true);

  if (!API_URL || API_URL.includes("PASTE_YOUR_GAS_WEBAPP_URL_HERE")){
    return show(msg, "API_URL が未設定です（GAS Web App URL を貼ってください）", true);
  }

  const btn = $("submitBtn");
  btn.disabled = true;
  const prev = btn.textContent;
  btn.textContent = "送信中…";

  try{
        // JSONはやめて、フォーム形式でPOST（GASで一番通りやすい）
    const params = new URLSearchParams();

    // 認証
    params.set("token", API_TOKEN);

    // データ（GAS側 parseRequest_ が拾えるキー名で送る）
    params.set("applicationType", d.applicationType);
    params.set("name", d.name);
    params.set("salesDate", d.salesDay);      // ←GASは salesDate を見る想定
    params.set("store", d.store);

    params.set("transferAmount", d.transferAmount);
    params.set("transferDate", d.transferDay);
    params.set("transferTo", d.transferTo);

    params.set("salesCash", d.salesCash);
    params.set("salesCredit", d.salesCredit);
    params.set("salesQR", d.salesQR);

    params.set("expCash", d.expCash);
    params.set("expUpsider", d.expUpsider);
    params.set("expSMBC", d.expSMBC);

    params.set("shortageRequest", d.shortageRequest);
    params.set("note", d.note);

    const res = await fetch(API_URL, {
      method: "POST",
      body: params
      // headers不要（ブラウザが自動で application/x-www-form-urlencoded を付ける）
    });

    const json = await res.json().catch(()=> ({}));
    if (!res.ok || json.ok !== true) throw new Error(json.error || "送信に失敗しました");

    show(msg, "送信完了しました。", false);

    document.querySelector("form")?.reset?.(); // formタグがある場合
    
  }catch(e){
    show(msg, "エラー：" + e.message, true);
  }finally{
    btn.disabled = false;
    btn.textContent = prev;
  }
}

$("toConfirm").addEventListener("click", gotoConfirm);
$("backToEdit").addEventListener("click", backToEdit);
$("submitBtn").addEventListener("click", submit);
