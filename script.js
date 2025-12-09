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

  // 👇 ROTA CORRETA
  const API_URL =
    "https://api-ferias-production.up.railway.app/calcular-ferias";

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

    document.getElementById("resBruto").innerText = formatMoney(
      data.valorBrutoFerias
    );
    document.getElementById("resINSS").innerText =
      "- " + formatMoney(data.descontos.impostoINSS);
    document.getElementById("resLiquido").innerText = formatMoney(
      data.valorLiquidoFinal
    );

    if (data.abono) {
      abonoSection.classList.remove("d-none");
      document.getElementById("resAbono").innerText = formatMoney(
        data.abono.totalAbono
      );
    } else {
      abonoSection.classList.add("d-none");
    }

    resultCard.style.display = "block";
  } catch (error) {
    errorAlert.innerText = error.message;
    errorAlert.classList.remove("d-none");
  }
});
