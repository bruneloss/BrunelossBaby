/* Textos das notificações: cada tipo tem algumas variações para não ficar repetitivo */

const sorteia = lista => lista[Math.floor(Math.random() * lista.length)];
const corta = (t, n = 140) => (t || '').length > n ? t.slice(0, n - 1) + '…' : (t || '');
const dinheiro = v => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function recado(de, texto) {
  return {
    tipo: 'recado',
    titulo: sorteia([`💌 ${de} te mandou um recadinho`, `💌 Chegou recadinho de ${de}!`, `💌 Tem recado novo na TV`]),
    corpo: corta(texto) || 'Abra o app para ler 💚',
  };
}

export function beijo(de) {
  return {
    tipo: 'beijo',
    titulo: sorteia([`💋 ${de} te deu um beijinho!`, `💋 Smack! Beijinho de ${de}`, `💋 Olha o carinho de ${de} chegando`]),
    corpo: sorteia(['Abre o app e devolve esse beijinho 😚', 'O coração do nível de amor encheu mais um pouquinho 💗', 'Alguém está com saudade 🥰']),
  };
}

export function prioridade(de, texto) {
  return {
    tipo: 'prioridade',
    titulo: sorteia([`🚨 ${de} adicionou uma prioridade`, `🚨 Nova prioridade do dia`]),
    corpo: corta(texto) + ' · Toque no alerta vermelho para ver',
  };
}

export function conta(c, quando, nomePaga) {
  return {
    tipo: 'conta',
    titulo: quando === 'hoje' ? `💸 ${c.nome} vence hoje` : `💸 ${c.nome} vence amanhã`,
    corpo: `${dinheiro(c.valor)} · quem paga: ${nomePaga}. ${quando === 'hoje' ? 'Já pagou? Marque no app ✅' : 'Bom lembrar com antecedência 😉'}`,
  };
}

export function agenda(ev, nomeDe) {
  const icones = { aniversario: '🎂', data: '💖', rotina: '🔁', evento: '📅' };
  const ic = icones[ev.tipo] || '📅';
  const hora = ev.diaTodo || !ev.inicio ? 'O dia todo' : `Às ${ev.inicio}${ev.fim ? ' até ' + ev.fim : ''}`;
  return {
    tipo: 'agenda',
    titulo: ev.tipo === 'aniversario' ? `🎂 Hoje é dia de: ${ev.titulo}` : `${ic} Hoje: ${ev.titulo}`,
    corpo: `${hora} · ${nomeDe}${ev.descricao ? ' · ' + corta(ev.descricao, 80) : ''}`,
  };
}

export function ofensiva(dias) {
  return {
    tipo: 'ofensiva',
    titulo: `❤️‍🔥 A ofensiva de ${dias} ${dias === 1 ? 'dia' : 'dias'} está em risco!`,
    corpo: sorteia([
      'Ninguém registrou nada hoje. Um recadinho já salva! 💌',
      'Ainda dá tempo até a meia-noite: um beijinho no sofá resolve 💋',
      'Não deixem o coração apagar! Marquem uma tarefa ou mandem um recado ✨',
    ]),
  };
}
