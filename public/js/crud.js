// public/js/crud.js
// Liga o formulário da seção "Banco de dados" às funções de public/js/firebase.js.

const $ = (id) => document.getElementById(id);
const elCaminho = $("db-caminho");
const elValor = $("db-valor");
const elSaida = $("db-saida");
const elAoVivo = $("db-ao-vivo");
const elStatus = $("db-status");
const botoes = document.querySelectorAll("[data-op]");

function mostrar(titulo, dado) {
  elSaida.textContent = `${titulo}\n${JSON.stringify(dado, null, 2)}`;
}

function erro(e) {
  elSaida.textContent = `Erro: ${e.code ?? ""} ${e.message}`;
}

function lerJson() {
  const texto = elValor.value.trim();
  if (!texto) throw new Error("Informe um valor JSON.");
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error('JSON inválido. Exemplo: {"mensagem": "olá"}');
  }
}

function travar(travado) {
  botoes.forEach((b) => (b.disabled = travado));
}

try {
  const fb = await import("./firebase.js");
  elStatus.textContent = "conectado";

  const operacoes = {
    async create() {
      await fb.create(elCaminho.value, lerJson());
      mostrar(`create ${elCaminho.value}`, await fb.read(elCaminho.value));
    },
    async read() {
      mostrar(`read ${elCaminho.value}`, await fb.read(elCaminho.value));
    },
    async update() {
      await fb.updateNode(elCaminho.value, lerJson());
      mostrar(`update ${elCaminho.value}`, await fb.read(elCaminho.value));
    },
    async delete() {
      if (!confirm(`Apagar "${elCaminho.value}" e tudo dentro dele?`)) return;
      await fb.deleteNode(elCaminho.value);
      mostrar(`delete ${elCaminho.value}`, null);
    },
    async push() {
      const key = await fb.pushChild(elCaminho.value, lerJson());
      mostrar(`push ${elCaminho.value}/${key}`, await fb.read(`${elCaminho.value}/${key}`));
    },
  };

  botoes.forEach((botao) => {
    botao.addEventListener("click", async () => {
      travar(true);
      try {
        await operacoes[botao.dataset.op]();
      } catch (e) {
        erro(e);
      } finally {
        travar(false);
      }
    });
  });

  // Visualização em tempo real do nó "aula"
  fb.watch("aula", (dado) => {
    elAoVivo.textContent = JSON.stringify(dado, null, 2) ?? "vazio";
  });
} catch (e) {
  elStatus.textContent = "sem conexão";
  erro(e);
  travar(true);
}