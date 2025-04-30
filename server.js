const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_KEY = 'chave_secreta';

// Banco de dados simulado
const users = [
  { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', email: 'user@example.com', password: 'user123', role: 'user' },
];

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: apenas administradores' });
  }
  next();
}

// Endpoint de login (aceita username ou email)
app.post('/api/auth/login', (req, res) => {
  const { username, email, password } = req.body;
  const user = users.find(u => 
    ((u.username === username || u.email === email) && u.password === password)
  );

  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const token = generateToken(user);
  res.json({ token });
});

// Endpoint que retorna o próprio perfil do usuário logado
app.get('/api/users/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

// Endpoint que lista todos os usuários (apenas para admins)
app.get('/api/users', authenticateToken, authorizeAdmin, (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role })));
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
