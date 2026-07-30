async function testLogin() {
  console.log('Testing MySQL Database Auth endpoint...');

  // 1. Test Valid Credentials
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo: 'ADM001', password: '1234' })
    });
    const data = await res.json();
    console.log('\n🔐 Test 1 - Valid MySQL Credentials (ADM001 / 1234):');
    console.log('Status Code:', res.status);
    console.log('Response Payload:', data);
  } catch (err) {
    console.error('Test 1 failed:', err.message);
  }

  // 2. Test Invalid Password
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo: 'ADM001', password: 'wrongpassword' })
    });
    const data = await res.json();
    console.log('\n❌ Test 2 - Invalid Password (ADM001 / wrongpassword):');
    console.log('Status Code:', res.status);
    console.log('Response Payload:', data);
  } catch (err) {
    console.error('Test 2 failed:', err.message);
  }

  process.exit(0);
}

testLogin();
