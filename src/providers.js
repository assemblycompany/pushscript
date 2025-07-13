/**
 * LLM provider configuration for PushScript
 * Configures multiple AI providers for commit message generation
 */

import fetch from 'node-fetch';
import config from './utils/config.js';
import { GeminiTokenManager } from './token-utils.js';

// Provider configurations with default models and API endpoints
export const LLM_PROVIDERS = {
  groq: {
    apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    headerTemplate: (apiKey) => ({ 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    responseHandler: (data) => data.choices[0].message.content.trim(),
    requestBuilder: (prompt, model, maxTokens) => ({
      // Groq requires the model parameter, so use default if not specified
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a senior software developer. Create a concise, conventional commit message that strictly follows the Conventional Commits format: 
          
          <type>(<scope>): <description>
          
          Valid types: feat, fix, docs, style, refactor, perf, test, chore
          
          Example formats:
          - feat(ui): add new button component
          - fix(auth): resolve login issue with expired tokens
          - docs(readme): update installation instructions
          
          Use lowercase for type and scope. Keep the first line under 80 characters.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens
    })
  },
  openai: {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    headerTemplate: (apiKey) => ({ 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    responseHandler: (data) => data.choices[0].message.content.trim(),
    requestBuilder: (prompt, model, maxTokens) => ({
      // OpenAI may also require model parameter, so use default if not specified
      model: model || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a senior software developer. Create a concise, conventional commit message that strictly follows the Conventional Commits format: 
          
          <type>(<scope>): <description>
          
          Valid types: feat, fix, docs, style, refactor, perf, test, chore
          
          Example formats:
          - feat(ui): add new button component
          - fix(auth): resolve login issue with expired tokens
          - docs(readme): update installation instructions
          
          Use lowercase for type and scope. Keep the first line under 80 characters.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens
    })
  },
  anthropic: {
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3.7-sonnet',
    headerTemplate: (apiKey) => ({ 
      'x-api-key': apiKey, 
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }),
    responseHandler: (data) => data.content[0].text,
    requestBuilder: (prompt, model, maxTokens) => ({
      // Anthropic also requires the model parameter
      model: model || 'claude-3.7-sonnet',
      messages: [
        { 
          role: 'user', 
          content: `Create a concise, conventional commit message that strictly follows the Conventional Commits format: 
          
          <type>(<scope>): <description>
          
          Valid types: feat, fix, docs, style, refactor, perf, test, chore
          
          Example formats:
          - feat(ui): add new button component
          - fix(auth): resolve login issue with expired tokens
          - docs(readme): update installation instructions
          
          Use lowercase for type and scope. Keep the first line under 80 characters.
          
          For the following changes: ${prompt}` 
        }
      ],
      max_tokens: maxTokens
    })
  },
  gemini: {
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    defaultModel: 'gemini-2.0-flash',
    headerTemplate: (apiKey) => {
      // Validate API key format for Google APIs
      if (!apiKey) {
        throw new Error('Gemini API key is required');
      }
      
      // Google API keys should start with "AIza" - warn if they don't but don't auto-fix
      if (!apiKey.startsWith('AIza')) {
        console.warn('Warning: Gemini API key should start with "AIza". Please verify your API key format.');
      }
      
      return {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      };
    },
    responseHandler: (data) => {
      // Validate response structure before attempting to extract content
      if (!data) {
        throw new Error('Empty response received from Gemini API');
      }
      
      if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        throw new Error('No candidates found in Gemini API response');
      }
      
      const candidate = data.candidates[0];
      if (!candidate.content) {
        throw new Error('No content found in Gemini API response candidate');
      }
      
      if (!candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
        throw new Error('No content parts found in Gemini API response');
      }
      
      if (!candidate.content.parts[0].text) {
        throw new Error('No text found in Gemini API response content parts');
      }
      
      // If we've made it here, we have valid text content
      const rawText = candidate.content.parts[0].text;
      
      // Log the raw response for debugging if it contains problematic characters
      if (rawText.includes('```') || rawText.includes('`')) {
        console.log('Raw Gemini API response:', JSON.stringify(rawText, null, 2));
      }
      
      // Sanitize the response to remove markdown formatting that causes shell issues
      // Gemini sometimes adds code blocks and backticks which break git commit commands
      const sanitizedText = rawText
        .replace(/```[\s\S]*?```/g, '')  // Remove entire code blocks (including content)
        .replace(/```+/g, '')            // Remove any remaining backticks
        .replace(/\n\s*\n\s*\n/g, '\n')  // Normalize multiple newlines
        .replace(/\n\s*\n/g, '\n')       // Normalize double newlines to single
        .replace(/^\s+|\s+$/g, '')       // Trim whitespace from start and end
        .trim();                         // Final trim
      
      // Additional validation: if the result still contains problematic characters, log a warning
      if (sanitizedText.includes('`') || sanitizedText.includes('```')) {
        console.warn('Warning: Sanitized response still contains backticks, applying additional cleanup');
        return sanitizedText
          .replace(/`/g, '')             // Remove any remaining backticks
          .replace(/\n\s*\n/g, '\n')     // Normalize newlines again
          .trim();
      }
      
      return sanitizedText;
    },
    requestBuilder: (prompt, model, maxTokens) => {
      // Configure Gemini-specific parameters based on our token manager knowledge
      const tokenManager = new GeminiTokenManager();
      
      return {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a senior software developer. Create a concise, conventional commit message that strictly follows the Conventional Commits format. 

IMPORTANT: Create a detailed commit message that explains the changes clearly. You may include a brief description after the first line if needed. Do NOT use markdown formatting, code blocks, or backticks. Return plain text only.

Format: <type>(<scope>): <description>

Valid types: feat, fix, docs, style, refactor, perf, test, chore

Example formats:
- feat(ui): add new button component
- fix(auth): resolve login issue with expired tokens
- docs(readme): update installation instructions

Use lowercase for type and scope. Keep the first line under 80 characters.

For the following changes: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: maxTokens || 100,
          temperature: 0,
          topP: 0.95,
          topK: 40
        },
        // Safety settings - set to low thresholds since this is just code commit generation
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      };
    }
  }
};

/**
 * Lists available models for the Gemini API
 * This helper function can be used to troubleshoot model availability issues
 * @param {string} apiKey - The Gemini API key
 * @returns {Promise<Array>} List of available models
 */
export async function listGeminiModels(apiKey) {
  try {
    // Validate API key
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    if (!apiKey.startsWith('AIza')) {
      console.warn('Warning: Gemini API key should start with "AIza". Please verify your API key format.');
    }
    
    // Call the ListModels endpoint
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to list models: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Filter for text generation models and sort by name
    const validModels = data.models
      .filter(model => 
        model.supportedGenerationMethods && 
        model.supportedGenerationMethods.includes('generateContent')
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return validModels;
  } catch (error) {
    console.error('Error listing Gemini models:', error.message);
    return [];
  }
}

/**
 * Gets the configuration details for the selected LLM provider
 * @returns {Object} Provider configuration details
 */
export function getProviderConfig() {
  // Use the provider from config
  const providerName = config.provider.toLowerCase();
  const providerConfig = LLM_PROVIDERS[providerName];
  
  if (!providerConfig) {
    console.error(`Error: Unknown provider "${providerName}". Supported providers: ${Object.keys(LLM_PROVIDERS).join(', ')}`);
    // Default to Groq if provider not found
    return {
      name: 'groq',
      apiKey: config.apiKey,
      model: config.model,
      config: LLM_PROVIDERS.groq
    };
  }
  
  return {
    name: providerName,
    apiKey: config.apiKey,
    model: config.model,
    config: providerConfig
  };
}

/**
 * Builds an API request for a given provider
 * @param {Object} providerDetails - The provider configuration from getProviderConfig
 * @param {String} prompt - The input prompt for the LLM
 * @param {Number} maxTokens - Maximum tokens for the response
 * @returns {Object} Request configuration for fetch API
 */
export async function buildApiRequest(providerDetails, prompt, maxTokens = 500) {
  const { config, apiKey, model } = providerDetails;
  
  // Generate request body with or without model
  const requestBody = config.requestBuilder(prompt, model, maxTokens);
  
  // Create the base request object
  let request = {
    method: 'POST',
    headers: config.headerTemplate(apiKey),
    body: JSON.stringify(requestBody)
  };
  
  // For providers like Gemini that have model in the URL
  let endpoint = config.apiEndpoint;
  
  // Special handling for providers that need model in endpoint
  if (config.getEndpoint && apiKey) {
    endpoint = config.getEndpoint(apiKey);
  } else if (endpoint.includes('{model}') && model) {
    // Replace {model} placeholder in endpoint
    endpoint = endpoint.replace('{model}', model);
  } else if (endpoint.includes('{model}') && !model) {
    // For Gemini, we must have a model in URL, so use default if not specified
    endpoint = endpoint.replace('{model}', config.defaultModel);
  }
  
  // Return the request with the endpoint
  return { request, endpoint };
}

/**
 * Retry wrapper for API requests with exponential backoff
 * @param {Function} requestFn - Function that makes the API request
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} The API response
 */
export async function retryApiRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if this is a retryable error
      const isRetryable = error.message.includes('503') || 
                         error.message.includes('overloaded') ||
                         error.message.includes('UNAVAILABLE') ||
                         error.message.includes('rate limit');
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
} 