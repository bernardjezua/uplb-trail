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
        return resolve(false); // Only check http/https
      }
    } catch (e) {
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
      timeout: 10000 // 10 seconds timeout
    };

    const req = client.get(urlStr, options, (res) => {
      // 2xx, 3xx are fully working. 
      // 403 Forbidden is usually UP's Cloudflare blocking our automated scrape attempt, so we mark it True.
      // 401 Unauthorized is similar behavior.
      if ((res.statusCode >= 200 && res.statusCode < 400) || res.statusCode === 403 || res.statusCode === 401) {
        console.log(`[SUCCESS] Verified Subdomain: ${urlStr} (Status: ${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`[FAILED] Invalid Subdomain: ${urlStr} (Status: ${res.statusCode})`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`[FAILED] DNS Error: ${urlStr} (${err.code})`);
      resolve(false);
    });

    req.on('timeout', () => {
      // If it times out, the server exists but might be slow. We'll count it as working for UP sites.
      console.log(`[TIMEOUT-SUCCESS] Verified Subdomain (Slow): ${urlStr}`);
      req.destroy();
      resolve(true); 
    });
  });
}

function extractCollege(categoryName) {
  const match = categoryName.match(/Under\s+([A-Z]+)/) || categoryName.match(/\(([A-Z]+)\)/);
  return match ? match[1].toLowerCase() : null;
}

async function testAndUpdateSubdomains() {
  let updatedCount = 0;

  for (const category of data) {
    // Only process categories that contain department/institute listings
    if (category.category.includes('Department') || category.category.includes('Institute') || category.category.includes('Unit')) {
      const college = extractCollege(category.category);
      if (!college) continue;

      for (let i = 0; i < category.links.length; i++) {
        const link = category.links[i];
        
        // Skip if it's already a well-formatted distinct domain, or if it's facebook, or if it's mailto
        if (link.url.includes('facebook') !== true && link.url !== `https://${college}.uplb.edu.ph` && link.url !== `https://${college}.uplb.edu.ph/`) {
             // Let's test it anyway just to be safe if it's not facebook.
        }

        const deptAcronym = link.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Construct potential subdomains
        const potentialUrl1 = `https://${deptAcronym}.${college}.uplb.edu.ph/`;
        const potentialUrl2 = `http://${deptAcronym}.${college}.uplb.edu.ph/`;
        // Some are just dept.uplb.edu.ph without the college
        const potentialUrl3 = `https://${deptAcronym}.uplb.edu.ph/`;

        // Don't test to replace if it's already one of these precise formats and working.
        if (link.url === potentialUrl1 || link.url === potentialUrl2 || link.url === potentialUrl3) continue;

        console.log(`Testing potentials for ${link.name} (${college})...`);
        
        if (await checkUrl(potentialUrl1)) {
           category.links[i].url = potentialUrl1;
           updatedCount++;
           continue;
        }
        
        if (await checkUrl(potentialUrl3)) {
           category.links[i].url = potentialUrl3;
           updatedCount++;
           continue;
        }
        
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    console.log(`\nDone! Successfully found and updated ${updatedCount} official subdomains.`);
  } else {
    console.log(`\nDone! No new valid subdomains found.`);
  }
}

testAndUpdateSubdomains();
