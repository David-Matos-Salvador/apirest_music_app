// Uso: npm run make-admin -- usuario@example.com
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { ROLES, User } from '../src/models/user.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Indica el email del usuario: npm run make-admin -- usuario@example.com');
  process.exit(1);
}

await connectDatabase(env.MONGODB_URI);
const user = await User.findOneAndUpdate({ email }, { role: ROLES.ADMIN }, { returnDocument: 'after' });
console.log(user ? `${user.email} ahora es administrador` : `No existe ningún usuario con email ${email}`);
await disconnectDatabase();
