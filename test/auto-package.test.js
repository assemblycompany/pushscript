/**
 * Tests for auto-package setup functionality
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { findProjectRoot, updatePackageJson } from '../src/setup/auto-package.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Auto-Package Setup', () => {
  test('findProjectRoot should find current directory when not in node_modules', () => {
    const result = findProjectRoot();
    assert.ok(result);
    assert.ok(typeof result === 'string');
    assert.ok(result.length > 0);
  });

  test('findProjectRoot should handle node_modules path correctly', () => {
    // Mock process.cwd to simulate being in node_modules
    const originalCwd = process.cwd;
    process.cwd = () => '/some/project/node_modules/pushscript';
    
    const result = findProjectRoot();
    
    // Restore original cwd
    process.cwd = originalCwd;
    
    assert.strictEqual(result, '/some/project');
  });

  test('updatePackageJson should handle missing package.json gracefully', () => {
    const tempDir = '/nonexistent/directory';
    const result = updatePackageJson(tempDir);
    assert.strictEqual(result, false);
  });

  test('updatePackageJson should add scripts to valid package.json', () => {
    // Create a temporary directory and package.json for testing
    const tempDir = path.join(__dirname, 'temp-test');
    const packagePath = path.join(tempDir, 'package.json');
    
    try {
      // Create temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Create a basic package.json
      const testPackage = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          test: 'echo "test"'
        }
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(testPackage, null, 2));
      
      // Run the update function
      const result = updatePackageJson(tempDir);
      
      // Check that it succeeded
      assert.strictEqual(result, true);
      
      // Verify the package.json was updated
      const updatedPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      assert.strictEqual(updatedPackage.scripts.push, 'pushscript');
      assert.strictEqual(updatedPackage.scripts.commit, 'pushscript commit');
      assert.strictEqual(updatedPackage.scripts.pushscript, 'pushscript');
      
      // Original script should still be there
      assert.strictEqual(updatedPackage.scripts.test, 'echo "test"');
      
    } finally {
      // Clean up
      if (fs.existsSync(packagePath)) {
        fs.unlinkSync(packagePath);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }
    }
  });

  test('updatePackageJson should not overwrite existing scripts', () => {
    // Create a temporary directory and package.json for testing
    const tempDir = path.join(__dirname, 'temp-test-2');
    const packagePath = path.join(tempDir, 'package.json');
    
    try {
      // Create temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Create a package.json with existing push script
      const testPackage = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          push: 'custom-push-command',
          test: 'echo "test"'
        }
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(testPackage, null, 2));
      
      // Run the update function
      const result = updatePackageJson(tempDir);
      
      // Check that it succeeded (added other scripts)
      assert.strictEqual(result, true);
      
      // Verify the package.json was updated but didn't overwrite existing script
      const updatedPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      assert.strictEqual(updatedPackage.scripts.push, 'custom-push-command'); // Should not be overwritten
      assert.strictEqual(updatedPackage.scripts.commit, 'pushscript commit'); // Should be added
      assert.strictEqual(updatedPackage.scripts.pushscript, 'pushscript'); // Should be added
      
    } finally {
      // Clean up
      if (fs.existsSync(packagePath)) {
        fs.unlinkSync(packagePath);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }
    }
  });
}); 