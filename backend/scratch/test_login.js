async function testLogin() {
  try {
    const response = await fetch('https://projectmanager-7l8c.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@demo.com',
        password: 'Password123!'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
