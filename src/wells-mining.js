/**
 * Test file with hardcoded secrets
 * This file should trigger our secret detection
 */

const settings = {
    // This should trigger a critical detection
    openai_api_key: 'sk-1234567890abcdef1234567890abcdef1234567890abcdef',
    
    // This should trigger a critical detection
    aws_secret_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    
    // This should trigger a high detection
    github_token: 'ghp_1234567890abcdef1234567890abcdef1234567890',
    
    // This should be filtered out as test data
    test_key: 'test1234567890abcdef',
    
    // Normal variable
    normal_var: 'hello world'
  };
  
  module.exports = settings; 