const form = document.getElementById("calcForm");
const resultCard = document.getElementById("resultCard");
const errorAlert = document.getElementById("errorAlert");
const abonoSection = document.getElementById("abonoSection");

// Formatador de Moeda (BRL)
const formatMoney = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpa estados anteriores
  errorAlert.classList.add("d-none");
  resultCard.style.display = "none";

  // Pega os valores
  const salario = Number(document.getElementById("salario").value);
  const diasFerias = Number(document.getElementById("diasFerias").value);
  const abono = Number(document.getElementById("abono").value) || 0;

  // Prepara JSON
  const payload = { salario, diasFerias, abono };
  const API_URL = "https://api-ferias-chi.vercel.app/";
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

    // Popula os dados na tela
    document.getElementById("resBruto").innerText = formatMoney(
      data.valorBrutoFerias
    );
    document.getElementById("resINSS").innerText =
      "- " + formatMoney(data.descontos.impostoINSS);
    document.getElementById("resLiquido").innerText = formatMoney(
      data.valorLiquidoFinal
    );

    // Lógica visual do Abono
    if (data.abono) {
      abonoSection.classList.remove("d-none");
      document.getElementById("resAbono").innerText = formatMoney(
        data.abono.totalAbono
      );
    } else {
      abonoSection.classList.add("d-none");
    }

    // Mostra o resultado com animação simples
    resultCard.style.display = "block";
  } catch (error) {
    errorAlert.innerText = error.message;
    errorAlert.classList.remove("d-none");
  }
});
