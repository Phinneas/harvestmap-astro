// Clean PickYourOwn.org AME2email.php URLs from farm website fields.
// These are edit-form links on PYO, not actual farm websites.
// If the real website is encoded in the EW parameter, extract it.
// Otherwise, remove the website field entirely.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const farmsDir = join(process.cwd(), 'src', 'data', 'farms');
let cleaned = 0;
let extracted = 0;
let removed = 0;

function scanDir(dir: string) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.json')) {
      try {
        const raw = readFileSync(fullPath, 'utf-8');
        const farm = JSON.parse(raw);

        if (farm.website && farm.website.includes('pickyourown.org/AME2email')) {
          // Decode HTML entities first (&amp; -> &)
          const decodedUrl = farm.website.replace(/&amp;/g, '&');

          // Try to extract real website from EW parameter
          const ewMatch = decodedUrl.match(/[?&]EW=([^&]+)/);
          let realWebsite: string | null = null;

          if (ewMatch) {
            const decoded = decodeURIComponent(ewMatch[1]).replace(/\+/g, ' ').trim();
            if (decoded && decoded.startsWith('http')) {
              realWebsite = decoded;
            }
          }

          if (realWebsite) {
            farm.website = realWebsite;
            extracted++;
          } else {
            delete farm.website;
            removed++;
          }

          writeFileSync(fullPath, JSON.stringify(farm, null, 2) + '\n');
          cleaned++;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

scanDir(farmsDir);

console.log(`Cleaned ${cleaned} farm files`);
console.log(`  Extracted real website from EW param: ${extracted}`);
console.log(`  Removed PYO edit-form link (no real site): ${removed}`);
