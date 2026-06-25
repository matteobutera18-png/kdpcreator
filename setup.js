// ================================================================
//  setup.js — Script di Inizializzazione Admin
//  Esegui UNA SOLA VOLTA con: node setup.js
// ================================================================

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const USERS_FILE = path.join(__dirname, 'server', 'data', 'users.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise(resolve => rl.question(q, resolve));

async function setup() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   🏭 KDP FACTORY — Setup Iniziale Admin      ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // Verifica se l'utente admin esiste già
  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      const adminExists = users.find(u => u.username === 'admin');
      if (adminExists) {
        const overwrite = await question('⚠️  Admin già esistente. Vuoi sovrascrivere? (s/N): ');
        if (overwrite.toLowerCase() !== 's') {
          console.log('✅ Setup annullato. Account esistente conservato.\n');
          rl.close();
          return;
        }
        users = users.filter(u => u.username !== 'admin');
      }
    } catch {
      users = [];
    }
  }

  console.log('Crea la password per accedere alla Dashboard KDP Factory.\n');
  const password = await question('🔑 Inserisci la tua password (min 8 caratteri): ');

  if (password.length < 8) {
    console.log('❌ Password troppo corta. Riprova con almeno 8 caratteri.\n');
    rl.close();
    return;
  }

  const confirm = await question('🔑 Conferma password: ');
  if (password !== confirm) {
    console.log('❌ Le password non coincidono.\n');
    rl.close();
    return;
  }

  // Hash della password
  const hash = await bcrypt.hash(password, 12);

  // Salva utente admin
  const adminUser = {
    id:        'admin',
    username:  'admin',
    password:  hash,
    createdAt: new Date().toISOString(),
    role:      'admin',
  };

  users.push(adminUser);

  // Assicura che la cartella esista
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   ✅ Setup completato con successo!           ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║   Username: admin                            ║');
  console.log('║   Avvia il server con: npm run dev           ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  rl.close();
}

setup().catch(err => {
  console.error('❌ Errore durante il setup:', err.message);
  rl.close();
  process.exit(1);
});
