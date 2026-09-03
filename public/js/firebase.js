// public/js/firebase.js
// Versão web do scripts/databaseInsert.mjs.
// Carrega a config do Hosting (/__/firebase/init.json) e expõe o CRUD.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getDatabase, ref, get, set, update, remove, push, onValue,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Para testar abrindo o arquivo direto (sem Hosting), preencha aqui com a
// config de Console > Configurações do projeto > Seus apps. Em produção deixe null.
const CONFIG_LOCAL = null;

async function carregarConfig() {
  if (CONFIG_LOCAL) return CONFIG_LOCAL;
  const resposta = await fetch("/__/firebase/init.json");
  if (!resposta.ok) {
    throw new Error("Config do Firebase não encontrada. Rode com `firebase serve` ou publique no Hosting.");
  }
  return resposta.json();
}

export const app = initializeApp(await carregarConfig());
export const db = getDatabase(app);

// ---------- CRUD ----------
export async function create(path, value) {
  await set(ref(db, path), value);
}

export async function read(path) {
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function updateNode(path, fields) {
  await update(ref(db, path), fields);
}

export async function deleteNode(path) {
  await remove(ref(db, path));
}

export async function pushChild(path, value) {
  const newRef = await push(ref(db, path), value);
  return newRef.key;
}

/** Observa um caminho em tempo real; devolve função para parar de observar. */
export function watch(path, callback) {
  return onValue(ref(db, path), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
}