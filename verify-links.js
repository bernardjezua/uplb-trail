const fs = require('fs');
const https = require('https');
const http = require('http');

const dataFile = './src/data/uplb-links.json';
const rawData = fs.readFileSync(dataFile, 'utf8');
const data = JSON.parse(rawData);

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(urlStr);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        console.log(`Working (Skipping non-HTTP protocol ${parsedUrl.protocol}): ${urlStr}`);
        return resolve(true);
      }
    } catch (e) {
      console.log(`Failed (Invalid URL format): ${urlStr}`);
      return resolve(false);
    }

    const isHttps = urlStr.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000 // Extended timeout
    };

    const req = client.get(urlStr, options, (res) => {
      // 2xx, 3xx are fully working. 
      // 403 Forbidden is usually UP's Cloudflare blocking our automated scrape attempt, so we MUST mark it True to not delete genuine links.
      // 401 Unauthorized is similar behavior.
      if (res.statusCode >= 200 && res.statusCode < 400 || res.statusCode === 403 || res.statusCode === 401) {
        if (res.statusCode === 403) {
          console.log(`Working (403 Forbidden likely Cloudflare): ${urlStr}`);
        }
        resolve(true);
      } else {
        console.log(`Failed (Status ${res.statusCode}): ${urlStr}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      // ENOTFOUND clearly means DNS doesn't exist anymore, thus the link is dead or migrated
      console.log(`Failed (Error ${err.code}): ${urlStr}`);
      resolve(false);
    });

    req.on('timeout', () => {
      // UP sites take notoriously long to load from outside networks; assume TIMEOUT means the server might be alive but congested. Keeping it safe
      console.log(`Working (Timeout - Assuming UP Server is Slow): ${urlStr}`);
      req.destroy();
      resolve(true); 
    });
  });
}

async function verifyLinks() {
  const result = [];
  
  for (const category of data) {
    const verifiedLinks = [];
    for (const link of category.links) {
      if (await checkUrl(link.url)) {
        verifiedLinks.push(link);
      }
    }
    
    if (verifiedLinks.length > 0) {
      result.push({
        ...category,
        links: verifiedLinks
      });
    }
  }

  fs.writeFileSync(dataFile, JSON.stringify(result, null, 2));
  console.log('Links verified and saved.');
}

verifyLinks();
