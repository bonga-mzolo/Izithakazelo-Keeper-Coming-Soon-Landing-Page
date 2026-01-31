const fs = require('fs');
const path = require('path');

// 1. CONFIGURATION
const DATA_PATH = './data/clans.json';
const TEMPLATE_PATH = './src/clan-template.html';
const OUTPUT_DIR = './clans';
const SITE_URL = 'https://izithakazelokeeper.co.za';

// 2. READ DATA & TEMPLATE
const clansData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// 3. CREATE OUTPUT FOLDER
if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR);
}

// Keep track of pages for the sitemap
let sitemapLinks = [];

// 4. GENERATE INDIVIDUAL CLAN PAGES
clansData.forEach(clan => {
    let html = template;

    // Create the praises HTML
    const praiseHtml = clan.izithakazelo.map(line => `<p>${line}</p>`).join('');
    
    // Create a snippet for SEO (the first 150 characters)
    const snippet = clan.izithakazelo.join(', ').substring(0, 150);

    // Replace all placeholders
    html = html.replace(/{{CLAN_NAME}}/g, clan.name);
    html = html.replace('{{PRAISES_HTML}}', praiseHtml);
    html = html.replace('{{SNIPPET}}', snippet);

    // Save file
    const safeName = clan.name.toLowerCase().trim().replace(/ /g, '-');
    const filename = `${safeName}.html`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), html);

    // Add to sitemap list
    sitemapLinks.push(`${SITE_URL}/clans/${filename}`);

    console.log(`Generated: clans/${filename}`);
});

// 5. GENERATE SITEMAP.XML
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/index.html</loc></url>
  <url><loc>${SITE_URL}/explore.html</loc></url>
  ${sitemapLinks.map(link => `<url><loc>${link}</loc></url>`).join('\n  ')}
</urlset>`;

fs.writeFileSync('./sitemap.xml', sitemapContent);

console.log('-----------------------------------');
console.log('Done! All clan pages and sitemap.xml generated.');