const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Cria um servidor HTTP simples para servir arquivos estáticos (HTML, imagens)
const server = http.createServer((req, res) => {
  console.log(req.url); // Loga a URL requisitada

  // Se a URL for o arquivo HTML, serve-o
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro ao carregar o arquivo HTML');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } 
  // Se for uma imagem, serve o arquivo de imagem correspondente
  else if (req.url.match(/\.(jpg|jpeg|png|gif)$/)) {
    const imagePath = path.join(__dirname, req.url);
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Imagem não encontrada');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      }
    });
  } 
  // Caso contrário, serve uma resposta 404 para outros tipos de arquivos
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Arquivo não encontrado');
  }
});

// Cria um servidor WebSocket ligado ao servidor HTTP
const wss = new WebSocket.Server({ server });

// Array para armazenar os clientes conectados
let clients = [];

wss.on('connection', (ws) => {
  // Adiciona o novo cliente à lista de clientes
  clients.push(ws);

  // Envia uma mensagem de boas-vindas para o novo cliente
  ws.send(JSON.stringify({ action: 'welcome', message: 'Bem-vindo ao servidor WebSocket!' }));

  // Quando o WebSocket recebe uma mensagem
  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);
    const data = JSON.parse(message);

    // Se o jogador clicou em uma carta
    if (data.action === 'chooseCard') {
      // Envia a carta escolhida para o outro jogador
      clients.forEach(client => {
        if (client !== ws) {
          // Envia para o outro jogador a carta escolhida e a mensagem "Sua vez"
          client.send(JSON.stringify({ action: 'revealCard', cardId: data.cardId, message: 'Sua vez!' }));
        }
      });
    }

    // Se for uma mensagem de chat
    if (data.action === 'chatMessage') {
      // Envia a mensagem para todos os clientes conectados (exceto para quem enviou)
      clients.forEach(client => {
        if (client !== ws) {
          client.send(JSON.stringify({ action: 'chatMessage', message: data.message }));
        }
      });
    }

    // Se for uma ação de "digitando"
    if (data.action === 'typing') {
      // Envia a notificação de "digitando" para todos os outros clientes
      clients.forEach(client => {
        if (client !== ws) {
          client.send(JSON.stringify({ action: 'typing', isTyping: data.isTyping }));
        }
      });
    }
  });

  // Quando um cliente se desconectar, removê-lo da lista
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

// O servidor HTTP também escuta na porta 8080
server.listen(8080, () => {
  console.log('Servidor HTTP e WebSocket funcionando na porta 8080');
});