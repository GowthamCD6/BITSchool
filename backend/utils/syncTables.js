import { connectDB } from '../config/db.js';
import { syncDatabase, Role, User } from '../models/index.js';

async function runSync() {
  console.log('Connecting to database and syncing Role & User tables...');
  const connected = await connectDB();
  if (connected) {
    await syncDatabase();
    const roles = await Role.findAll();
    const users = await User.findAll({ include: [{ model: Role, as: 'role' }] });

    console.log('==================================================');
    console.log(`✅ Roles in Database (${roles.length}):`);
    roles.forEach(r => console.log(`  - [ID: ${r.id}] ${r.name}: ${r.description}`));

    console.log(`\n✅ Users in Database (${users.length}):`);
    users.forEach(u => console.log(`  - [ID: ${u.id}] ${u.name} (Reg: ${u.regNo}, Email: ${u.email}, Role: ${u.role ? u.role.name : 'N/A'})`));
    console.log('==================================================');
  } else {
    console.error('Failed to connect to MySQL database');
  }
  process.exit(0);
}

runSync();
