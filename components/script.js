document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email: username, password })  // Enviando username ou email
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Armazenar o token no localStorage ou sessionStorage
      localStorage.setItem('token', data.token);
      document.getElementById('result').textContent = 'Login realizado com sucesso!';
    } else {
      document.getElementById('result').textContent = 'Credenciais inválidas';
    }
  })
  .catch(error => {
    document.getElementById('result').textContent = 'Erro ao conectar com o servidor';
  });
});

// Ação para visualizar o perfil
document.getElementById('btn-profile').addEventListener('click', function() {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:3000/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('result').textContent = `Perfil: ${data.username} - ${data.email}`;
    })
    .catch(error => {
      document.getElementById('result').textContent = 'Erro ao carregar perfil';
    });
  } else {
    document.getElementById('result').textContent = 'Você precisa estar logado';
  }
});

// Ação para ver os usuários
document.getElementById('btn-users').addEventListener('click', function() {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      const usersList = data.map(user => `<p>${user.username} - ${user.email}</p>`).join('');
      document.getElementById('result').innerHTML = usersList;
    })
    .catch(error => {
      document.getElementById('result').textContent = 'Erro ao carregar usuários';
    });
  } else {
    document.getElementById('result').textContent = 'Você precisa estar logado';
  }
});