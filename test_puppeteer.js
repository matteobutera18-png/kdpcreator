const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log("Navigating to dashboard...");
  await page.goto('http://localhost:3001/#/dashboard', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  if (content.includes('mix-sudoku-qty')) {
     console.log("Dashboard loaded successfully!");
  } else {
     console.log("Dashboard NOT loaded!");
  }
  
  await browser.close();
})();
