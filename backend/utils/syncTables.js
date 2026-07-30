import { connectDB } from '../config/db.js';
import { syncDatabase, Role, User, Grade, Class, Subject } from '../models/index.js';

async function runSync() {
  console.log('Connecting to database and syncing all MySQL tables (Role, User, Grade, Class, Subject)...');
  const connected = await connectDB();
  if (connected) {
    await syncDatabase();
    
    const roles = await Role.findAll();
    const users = await User.findAll({ include: [{ model: Role, as: 'role' }] });
    const grades = await Grade.findAll();
    const classes = await Class.findAll();
    const subjects = await Subject.findAll();

    console.log('\n==================================================');
    console.log(`✅ Roles in Database (${roles.length}):`);
    roles.forEach(r => console.log(`  - [ID: ${r.id}] ${r.name}`));

    console.log(`\n✅ Users in Database (${users.length}):`);
    users.forEach(u => console.log(`  - [ID: ${u.id}] ${u.name} (Reg: ${u.regNo}, Email: ${u.email}, Role: ${u.role ? u.role.name : 'N/A'})`));

    console.log(`\n✅ Grades in Database (${grades.length}):`);
    grades.forEach(g => console.log(`  - [ID: ${g.id}] ${g.name} (${g.level})`));

    console.log(`\n✅ Classes in Database (${classes.length}):`);
    classes.forEach(c => console.log(`  - [ID: ${c.id}] ${c.name} (Grade: ${c.gradeName}, Section: ${c.section}, Students: ${c.studentCount})`));

    console.log(`\n✅ Subjects in Database (${subjects.length}):`);
    subjects.forEach(s => console.log(`  - [ID: ${s.id}] [${s.code}] ${s.name} (${s.weeklyPeriods} periods/wk, Venue: ${s.requiredVenueType})`));

    console.log('==================================================\n');
  } else {
    console.error('Failed to connect to MySQL database');
  }
  process.exit(0);
}

runSync();
