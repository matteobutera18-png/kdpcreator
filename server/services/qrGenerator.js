// ================================================================
//  services/qrGenerator.js — QR Code per Accesso Remoto
// ================================================================

const QRCode = require('qrcode');
const os     = require('os');
const fs     = require('fs');
const config = require('../config');

/**
 * Ottieni l'indirizzo IP locale della macchina.
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

/**
 * Genera il QR code per accedere alla dashboard.
 * Priorità: ngrok URL > IP locale
 */
async function generate(port) {
  const localIP  = getLocalIP();
  const localURL = `http://${localIP}:${port}`;
  let   accessURL = localURL;

  // ── Prova a usare ngrok se il token è configurato ─────────
  const ngrokToken = process.env.NGROK_AUTHTOKEN;
  if (ngrokToken && ngrokToken.trim()) {
    try {
      // ngrok è opzionale — se non installato, usa IP locale
      const ngrok = require('@ngrok/ngrok');
      const listener = await ngrok.connect({
        addr:      port,
        authtoken: ngrokToken,
      });
      accessURL = listener.url();
      console.log(`\n🌍 Tunnel ngrok attivo: ${accessURL}`);
    } catch (err) {
      console.log(`\n⚠️  ngrok non disponibile: ${err.message}`);
      console.log('   Usando IP locale. Per accesso remoto, configura NGROK_AUTHTOKEN nel .env\n');
    }
  }

  // ── Genera QR code ────────────────────────────────────────
  try {
    // Salva come file PNG
    await QRCode.toFile(config.PATHS.qrImage, accessURL, {
      width:           300,
      margin:          2,
      color: {
        dark:  '#6C63FF',
        light: '#0A0A0F',
      },
      errorCorrectionLevel: 'H',
    });

    // Stampa QR nel terminale (versione ASCII)
    const qrTerminal = await QRCode.toString(accessURL, {
      type:   'terminal',
      small:  true,
    });

    console.log('\n┌────────────────────────────────────────────────────┐');
    console.log('│         📱 SCANSIONA PER APRIRE LA DASHBOARD        │');
    console.log('├────────────────────────────────────────────────────┤');
    console.log(qrTerminal);
    console.log(`│  🔗 URL: ${accessURL.padEnd(42)}│`);
    console.log('│                                                      │');
    console.log('│  ✅ QR salvato in: public/qr-access.png             │');
    console.log('└────────────────────────────────────────────────────┘\n');

  } catch (err) {
    console.error('⚠️  Errore generazione QR code:', err.message);
    console.log(`🌐 Accesso manuale: ${accessURL}`);
  }

  return { localURL, accessURL };
}

module.exports = { generate, getLocalIP };
