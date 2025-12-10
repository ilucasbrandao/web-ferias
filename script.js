const form = document.getElementById("calcForm");
const resultCard = document.getElementById("resultCard");
const errorAlert = document.getElementById("errorAlert");
const abonoSection = document.getElementById("abonoSection");

// Formatador BRL
const formatMoney = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorAlert.classList.add("d-none");
  resultCard.style.display = "none";

  const salario = Number(document.getElementById("salario").value);
  const diasFerias = Number(document.getElementById("diasFerias").value);
  const abono = Number(document.getElementById("abono").value) || 0;

  const payload = { salario, diasFerias, abono };

  // ROTA
  const API_URL = "https://api-ferias-production.up.railway.app/api";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao calcular");
    }

    /* ----------- VALORES BÁSICOS ---------- */
    document.getElementById("resBruto").innerText = formatMoney(
      data.valorBrutoFerias
    );

    document.getElementById("resDias").innerText = formatMoney(
      data.calculo.diasFeriasValor
    );
    document.getElementById("resTerco").innerText = formatMoney(
      data.calculo.valorTerco
    );

    /* ----------- ABONO ---------- */
    if (data.abono) {
      abonoSection.classList.remove("d-none");
      document
        .getElementById("abonoSectionDetalhado")
        .classList.remove("d-none");

      document.getElementById("resAbono").innerText = formatMoney(
        data.abono.totalAbono
      );
      document.getElementById("resAbonoValor").innerText = formatMoney(
        data.abono.valorAbono
      );
      document.getElementById("resAbonoTerco").innerText = formatMoney(
        data.abono.valorTercoSobreAbono
      );
    } else {
      abonoSection.classList.add("d-none");
      document.getElementById("abonoSectionDetalhado").classList.add("d-none");
    }

    /* ----------- DESCONTOS ---------- */
    document.getElementById("resINSS").innerText =
      "- " + formatMoney(data.descontos.impostoINSS);
    document.getElementById("resINSSDetalhado").innerText = formatMoney(
      data.descontos.impostoINSS
    );

    document.getElementById("resIRRF").innerText = formatMoney(
      data.descontos.impostoIRRF
    );

    /* ----------- FAIXAS DE INSS ---------- */
    const faixasContainer = document.getElementById("resINSSFaixas");
    faixasContainer.innerHTML = "";

    data.descontos.faixasINSS.forEach((faixa) => {
      const linha = document.createElement("div");
      linha.classList.add("d-flex", "justify-content-between");
      linha.innerHTML = `
    <span>${faixa.intervalo} (${(faixa.aliquota * 100).toFixed(1)}%)</span>
    <span>${formatMoney(faixa.valorDescontado)}</span>
  `;
      faixasContainer.appendChild(linha);
    });

    /* ----------- LÍQUIDO ---------- */
    document.getElementById("resLiquido").innerText = formatMoney(
      data.valorLiquidoFinal
    );

    resultCard.style.display = "block";
  } catch (error) {
    errorAlert.innerText = error.message;
    errorAlert.classList.remove("d-none");
  }
});
