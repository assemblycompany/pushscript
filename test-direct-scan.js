/**
 * Direct test of our secret detection
 */

import { scanFileForSecrets } from './src/security/secret-detector.js';
import fs from 'fs';

async function testDirectScan() {
  console.log('🧪 Testing Secret Detection Directly');
  console.log('='.repeat(50));
  
  const testFile = 'src/test-config-with-secrets.js';
  const content = fs.readFileSync(testFile, 'utf8');
  
  console.log(`📁 Testing file: ${testFile}`);
  console.log(`📄 Content length: ${content.length} characters`);
  
  const results = scanFileForSecrets(testFile, content);
  
  console.log(`🔍 Found ${results.length} secrets:`);
  
  if (results.length > 0) {
    results.forEach((secret, index) => {
      console.log(`\n${index + 1}. ${secret.description}`);
      console.log(`   Severity: ${secret.severity}`);
      console.log(`   Confidence: ${secret.confidence} (${secret.reason})`);
      console.log(`   File: ${secret.file}:${secret.line}`);
      console.log(`   Entropy: ${secret.entropy.toFixed(2)}`);
    });
  } else {
    console.log('❌ No secrets detected - this might indicate an issue');
  }
}

testDirectScan().catch(console.error); 