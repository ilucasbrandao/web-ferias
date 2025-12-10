const form = document.getElementById("calcForm");
const resultCard = document.getElementById("resultCard");
const errorAlert = document.getElementById("errorAlert");
const abonoSection = document.getElementById("abonoSectionDetalhado");

// Formatador BRL
const formatMoney = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpa estados
  errorAlert.classList.add("d-none");
  resultCard.style.display = "none";

  // Captura inputs
  const salario = Number(document.getElementById("salario").value);
  const diasFerias = Number(document.getElementById("diasFerias").value);
  const abono = Number(document.getElementById("abono").value) || 0;

  const payload = { salario, diasFerias, abono };

  // Detecta se está rodando no seu PC (localhost ou 127.0.0.1)
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Se for local, usa a porta 3000 do seu PC. Se não, usa a Railway.
  const API_URL = isLocal
    ? "http://localhost:3000/api"
    : "https://api-ferias-production.up.railway.app/api";

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

    // --- CÁLCULOS VISUAIS NO FRONTEND (Já que a API não manda separado) ---
    // Recalcula a proporção apenas para exibir bonitinho
    const valorDiasCalculado = (salario / 30) * diasFerias;
    const valorTercoCalculado = valorDiasCalculado / 3;

    // Preenche Férias
    document.getElementById("resBruto").innerText = formatMoney(
      data.valorBrutoFerias
    );
    document.getElementById("resDias").innerText =
      formatMoney(valorDiasCalculado);
    document.getElementById("resTerco").innerText =
      formatMoney(valorTercoCalculado);

    // --- ABONO ---
    if (data.abono) {
      abonoSection.classList.remove("d-none");
      // Mapeando as chaves exatas que seu backend retorna
      document.getElementById("resAbonoTotal").innerText = formatMoney(
        data.abono.totalAbono
      );
      document.getElementById("resAbonoValor").innerText = formatMoney(
        data.abono.valorAbono
      );
      // Backend manda 'tercoConstitucionalAbono', Frontend exibe aqui
      document.getElementById("resAbonoTerco").innerText = formatMoney(
        data.abono.tercoConstitucionalAbono
      );
    } else {
      abonoSection.classList.add("d-none");
    }

    // --- DESCONTOS ---
    document.getElementById("resINSS").innerText =
      "- " + formatMoney(data.descontos.impostoINSS);
    // Backend manda 'impostoIRPF' (com P), ajustamos aqui
    document.getElementById("resIRRF").innerText =
      "- " + formatMoney(data.descontos.impostoIRPF);

    // --- LÍQUIDO FINAL ---
    document.getElementById("resLiquido").innerText = formatMoney(
      data.valorLiquidoFinal
    );

    // Exibe resultado
    resultCard.style.display = "block";
  } catch (error) {
    console.error(error);
    errorAlert.innerText = "Erro: " + error.message;
    errorAlert.classList.remove("d-none");
  }
});
