const ws = new WebSocket('ws://localhost:8080');  // Conecta ao servidor WebSocket

// Quando o WebSocket estiver aberto
ws.onopen = () => {
  console.log('Conectado ao servidor');
};

// Quando uma carta for clicada, enviar para o servidor
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const cardId = card.getAttribute('data-card');
    ws.send(JSON.stringify({ action: 'chooseCard', cardId: cardId }));
  });
});

// Quando o servidor enviar a mensagem (para o outro jogador), exibir a carta virada
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.action === 'chooseCard') {
    revealCard(data.cardId);
  }
};

// Função para revelar a carta
function revealCard(cardId) {
  const card = document.querySelector(`.card[data-card="${cardId}"]`);
  card.textContent = `Imagem ${cardId}`;  // Troque isso por uma imagem real
}
