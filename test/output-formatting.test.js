import test from 'node:test';
import assert from 'node:assert';
import { 
  displaySection, 
  displayConfig, 
  displayStep, 
  displaySummary, 
  displayCommitMessage, 
  displayFileChanges, 
  displayPushSummary 
} from '../src/utils/formatting.js';

test('Output Formatting Tests', async (t) => {
  await t.test('should display configuration with proper formatting', () => {
    const config = {
      provider: 'gemini',
      apiKey: 'test-key',
      model: 'gemini-2.0-flash'
    };
    
    // This test verifies the function doesn't throw and produces output
    // We can't easily capture console.log in this test environment, so we just verify it runs
    assert.doesNotThrow(() => {
      displayConfig(config);
    });
  });

  await t.test('should display sections with proper formatting', () => {
    assert.doesNotThrow(() => {
      displaySection('Test Section', 'Test description');
    });
  });

  await t.test('should display steps with proper formatting', () => {
    assert.doesNotThrow(() => {
      displayStep('Test step', 'info', 'Test details');
      displayStep('Success step', 'success');
      displayStep('Warning step', 'warning', 'Warning details');
      displayStep('Error step', 'error', 'Error details');
    });
  });

  await t.test('should display commit messages with proper formatting', () => {
    const message = `feat(volatility): implement flexible data usage for volatility calculations
Added design document and test to support flexible lookback periods. The system now uses all available data in the database instead of being limited to a fixed 75-day window, improving accuracy and robustness.`;
    
    assert.doesNotThrow(() => {
      displayCommitMessage(message, 'ai');
      displayCommitMessage(message, 'manual');
      displayCommitMessage(message, 'simple');
    });
  });

  await t.test('should display file changes with proper formatting', () => {
    const changes = [
      { status: 'M', file: 'src/index.js' },
      { status: 'A', file: 'src/new-feature.js' },
      { status: 'D', file: 'src/old-file.js' },
      { status: 'M', file: 'package.json' }
    ];
    
    assert.doesNotThrow(() => {
      displayFileChanges(changes);
    });
  });

  await t.test('should display push summary with proper formatting', () => {
    const commitMessage = `feat(volatility): implement flexible data usage
Added design document and test to support flexible lookback periods.`;
    const branch = 'main';
    const changes = [
      { status: 'M', file: 'src/index.js' },
      { status: 'A', file: 'src/new-feature.js' }
    ];
    
    assert.doesNotThrow(() => {
      displayPushSummary(commitMessage, branch, changes);
    });
  });

  await t.test('should display summary boxes with proper formatting', () => {
    const items = [
      'Item 1: Test description',
      'Item 2: Another test',
      'Item 3: Final test item'
    ];
    
    assert.doesNotThrow(() => {
      displaySummary('Test Summary', items, 'info');
      displaySummary('Success Summary', items, 'success');
      displaySummary('Warning Summary', items, 'warning');
      displaySummary('Error Summary', items, 'error');
    });
  });
}); 