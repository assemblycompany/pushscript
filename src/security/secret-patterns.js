/**
 * Secret Patterns for PushScript
 * Comprehensive pattern definitions for secret detection
 * Clean separation: patterns (data) vs detection logic (behavior)
 */

/**
 * Core AI/LLM Service Patterns
 */
export const AI_PATTERNS = {
  'openai_api_key': {
    pattern: /\bsk-[a-zA-Z0-9]{48}\b/g,
    description: 'OpenAI API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'OpenAI',
    category: 'ai'
  },
  
  'openai_org_key': {
    pattern: /\borg-[a-zA-Z0-9]{24}\b/g,
    description: 'OpenAI Organization Key',
    severity: 'high',
    confidence: 'high',
    provider: 'OpenAI',
    category: 'ai'
  },
  
  'anthropic_api_key': {
    pattern: /\bsk-ant-[a-zA-Z0-9]{48}\b/g,
    description: 'Anthropic API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Anthropic',
    category: 'ai'
  },
  
  'google_ai_key': {
    pattern: /\bAIza[0-9A-Za-z-_]{35}\b/g,
    description: 'Google AI/Gemini API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Google',
    category: 'ai'
  },
  
  'groq_api_key': {
    pattern: /\bgsk_[a-zA-Z0-9]{48}\b/g,
    description: 'Groq API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Groq',
    category: 'ai'
  },
  
  'cohere_api_key': {
    pattern: /\bcohere-[a-zA-Z0-9]{40}\b/g,
    description: 'Cohere API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Cohere',
    category: 'ai'
  },
  
  'huggingface_token': {
    pattern: /\bhf_[a-zA-Z0-9]{39}\b/g,
    description: 'Hugging Face Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'Hugging Face',
    category: 'ai'
  },
  
  'replicate_token': {
    pattern: /\br8_[a-zA-Z0-9]{40}\b/g,
    description: 'Replicate API Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'Replicate',
    category: 'ai'
  }
};

/**
 * Cloud Infrastructure Patterns
 */
export const CLOUD_PATTERNS = {
  // AWS
  'aws_access_key': {
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    description: 'AWS Access Key ID',
    severity: 'critical',
    confidence: 'high',
    provider: 'AWS',
    category: 'cloud'
  },
  
  'aws_secret_key': {
    pattern: /\b[A-Za-z0-9/+=]{40}\b/g,
    description: 'AWS Secret Access Key',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.5,
    contextKeywords: ['aws', 'secret', 'access'],
    nearbyKeywords: ['AKIA', 'aws_secret', 'AWS_SECRET_ACCESS_KEY'],
    provider: 'AWS',
    category: 'cloud'
  },
  
  'aws_session_token': {
    pattern: /\bFQoGZXIvYXdz[0-9a-zA-Z/+]{300,}\b/g,
    description: 'AWS Session Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'AWS',
    category: 'cloud'
  },
  
  // Azure
  'azure_storage_key': {
    pattern: /\b[A-Za-z0-9+/]{88}==\b/g,
    description: 'Azure Storage Account Key',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.8,
    contextKeywords: ['azure', 'storage', 'account'],
    provider: 'Microsoft Azure',
    category: 'cloud'
  },
  
  'azure_connection_string': {
    pattern: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+/g,
    description: 'Azure Storage Connection String',
    severity: 'critical',
    confidence: 'high',
    provider: 'Microsoft Azure',
    category: 'cloud'
  },
  
  'azure_client_secret': {
    pattern: /\b[0-9a-zA-Z~_-]{34,40}\b/g,
    description: 'Azure Client Secret',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.5,
    contextKeywords: ['azure', 'client', 'secret', 'tenant'],
    provider: 'Microsoft Azure',
    category: 'cloud'
  },
  
  // Google Cloud
  'gcp_service_account': {
    pattern: /"type":\s*"service_account"[\s\S]*?"private_key":\s*"-----BEGIN PRIVATE KEY-----[^"]+"/g,
    description: 'Google Cloud Service Account JSON',
    severity: 'critical',
    confidence: 'high',
    provider: 'Google Cloud',
    category: 'cloud'
  },
  
  'gcp_api_key': {
    pattern: /\bAIza[0-9A-Za-z-_]{35}\b/g,
    description: 'Google Cloud API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Google Cloud',
    category: 'cloud'
  }
};

/**
 * Development & CI/CD Patterns
 */
export const DEVOPS_PATTERNS = {
  // Version Control
  'github_token': {
    pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}\b/g,
    description: 'GitHub Personal Access Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'GitHub',
    category: 'devops'
  },
  
  'github_app_key': {
    pattern: /-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/g,
    description: 'GitHub App Private Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'GitHub',
    category: 'devops'
  },
  
  'gitlab_token': {
    pattern: /\bglpat-[A-Za-z0-9_-]{20}\b/g,
    description: 'GitLab Personal Access Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'GitLab',
    category: 'devops'
  },
  
  'bitbucket_token': {
    pattern: /\bATBB[A-Za-z0-9_-]{59}\b/g,
    description: 'Bitbucket App Password',
    severity: 'critical',
    confidence: 'high',
    provider: 'Bitbucket',
    category: 'devops'
  },
  
  // CI/CD Platforms
  'circleci_token': {
    pattern: /\b[0-9a-fA-F]{40}\b/g,
    description: 'CircleCI Token',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['circleci', 'circle', 'ci'],
    provider: 'CircleCI',
    category: 'devops'
  },
  
  'jenkins_token': {
    pattern: /\b[0-9a-fA-F]{32}\b/g,
    description: 'Jenkins API Token',
    severity: 'high',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['jenkins', 'build'],
    provider: 'Jenkins',
    category: 'devops'
  },
  
  'travis_token': {
    // More specific pattern: Travis CI tokens are typically base64-like strings
    // Exclude common npm registry URL patterns and version strings
    pattern: /\b(?!https?:\/\/|registry\.|version|resolved|integrity)[0-9a-zA-Z_-]{22,}\b/g,
    description: 'Travis CI Token',
    severity: 'high',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    // Require actual "travis" keyword, not just "ci" (to avoid false positives from "registry", etc.)
    contextKeywords: ['travis'],
    requiresContext: true, // Require context keywords for this pattern
    provider: 'Travis CI',
    category: 'devops'
  }
};

/**
 * Communication & Collaboration Patterns
 */
export const COMMUNICATION_PATTERNS = {
  'slack_token': {
    pattern: /\bxox[baprs]-[0-9a-zA-Z-]{10,72}\b/g,
    description: 'Slack Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'Slack',
    category: 'communication'
  },
  
  'slack_webhook': {
    pattern: /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{9}\/[A-Z0-9]{11}\/[a-zA-Z0-9]{24}/g,
    description: 'Slack Webhook URL',
    severity: 'high',
    confidence: 'high',
    provider: 'Slack',
    category: 'communication'
  },
  
  'discord_token': {
    pattern: /\b[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}\b/g,
    description: 'Discord Bot Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'Discord',
    category: 'communication'
  },
  
  'discord_webhook': {
    pattern: /https:\/\/discord\.com\/api\/webhooks\/\d{17,19}\/[A-Za-z0-9_-]{68}/g,
    description: 'Discord Webhook URL',
    severity: 'high',
    confidence: 'high',
    provider: 'Discord',
    category: 'communication'
  },
  
  'teams_webhook': {
    pattern: /https:\/\/[a-z0-9]+\.webhook\.office\.com\/webhookb2\/[a-z0-9-]+\/IncomingWebhook\/[a-z0-9]+\/[a-z0-9-]+/g,
    description: 'Microsoft Teams Webhook',
    severity: 'high',
    confidence: 'high',
    provider: 'Microsoft Teams',
    category: 'communication'
  }
};

/**
 * Payment & Financial Patterns
 */
export const PAYMENT_PATTERNS = {
  'stripe_secret_key': {
    pattern: /\bsk_(test|live)_[0-9a-zA-Z]{24}\b/g,
    description: 'Stripe Secret Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Stripe',
    category: 'payment'
  },
  
  'stripe_publishable_key': {
    pattern: /\bpk_(test|live)_[0-9a-zA-Z]{24}\b/g,
    description: 'Stripe Publishable Key',
    severity: 'medium',
    confidence: 'high',
    provider: 'Stripe',
    category: 'payment'
  },
  
  'stripe_webhook_secret': {
    pattern: /\bwhsec_[A-Za-z0-9]{32,}\b/g,
    description: 'Stripe Webhook Secret',
    severity: 'critical',
    confidence: 'high',
    provider: 'Stripe',
    category: 'payment'
  },
  
  'paypal_client_id': {
    pattern: /\bA[A-Za-z0-9_-]{79}\b/g,
    description: 'PayPal Client ID',
    severity: 'high',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.5,
    contextKeywords: ['paypal', 'client'],
    provider: 'PayPal',
    category: 'payment'
  },
  
  'square_access_token': {
    pattern: /\bEAAA[0-9a-zA-Z_-]{59}\b/g,
    description: 'Square Access Token',
    severity: 'critical',
    confidence: 'high',
    provider: 'Square',
    category: 'payment'
  }
};

/**
 * Database Connection Patterns
 */
export const DATABASE_PATTERNS = {
  'mongodb_uri': {
    pattern: /mongodb(\+srv)?:\/\/[^:\s]+:[^@\s]+@[^\s\/]+/g,
    description: 'MongoDB Connection URI',
    severity: 'critical',
    confidence: 'high',
    provider: 'MongoDB',
    category: 'database'
  },
  
  'postgres_uri': {
    pattern: /postgres(ql)?:\/\/[^:\s]+:[^@\s]+@[^\s\/]+/g,
    description: 'PostgreSQL Connection URI',
    severity: 'critical',
    confidence: 'high',
    provider: 'PostgreSQL',
    category: 'database'
  },
  
  'mysql_uri': {
    pattern: /mysql:\/\/[^:\s]+:[^@\s]+@[^\s\/]+/g,
    description: 'MySQL Connection URI',
    severity: 'critical',
    confidence: 'high',
    provider: 'MySQL',
    category: 'database'
  },
  
  'redis_uri': {
    pattern: /redis:\/\/[^:\s]*:[^@\s]+@[^\s\/]+/g,
    description: 'Redis Connection URI',
    severity: 'critical',
    confidence: 'high',
    provider: 'Redis',
    category: 'database'
  },
  
  'sqlserver_uri': {
    pattern: /(mssql|sqlserver):\/\/[^:\s]+:[^@\s]+@[^\s\/]+/g,
    description: 'SQL Server Connection URI',
    severity: 'critical',
    confidence: 'high',
    provider: 'SQL Server',
    category: 'database'
  },
  
  'elasticsearch_uri': {
    pattern: /https?:\/\/[^:\s]+:[^@\s]+@[^\s\/]+:9200/g,
    description: 'Elasticsearch Connection URI',
    severity: 'high',
    confidence: 'high',
    provider: 'Elasticsearch',
    category: 'database'
  }
};

/**
 * Email & Communication Service Patterns
 */
export const EMAIL_PATTERNS = {
  'sendgrid_api_key': {
    pattern: /\bSG\.[0-9a-zA-Z_-]{22}\.[0-9a-zA-Z_-]{43}\b/g,
    description: 'SendGrid API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'SendGrid',
    category: 'email'
  },
  
  'mailgun_api_key': {
    pattern: /\bkey-[0-9a-f]{32}\b/g,
    description: 'Mailgun API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Mailgun',
    category: 'email'
  },
  
  'mailchimp_api_key': {
    pattern: /\b[0-9a-f]{32}-us\d{1,2}\b/g,
    description: 'Mailchimp API Key',
    severity: 'critical',
    confidence: 'high',
    provider: 'Mailchimp',
    category: 'email'
  },
  
  'postmark_token': {
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,
    description: 'Postmark Server Token',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['postmark', 'email'],
    provider: 'Postmark',
    category: 'email'
  },
  
  'twilio_auth_token': {
    pattern: /\b[0-9a-f]{32}\b/g,
    description: 'Twilio Auth Token',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['twilio', 'auth', 'sms'],
    provider: 'Twilio',
    category: 'email'
  },
  
  'twilio_account_sid': {
    pattern: /\bAC[0-9a-f]{32}\b/g,
    description: 'Twilio Account SID',
    severity: 'medium',
    confidence: 'high',
    provider: 'Twilio',
    category: 'email'
  }
};

/**
 * Monitoring & Analytics Patterns
 */
export const MONITORING_PATTERNS = {
  'datadog_api_key': {
    pattern: /\b[0-9a-f]{32}\b/g,
    description: 'DataDog API Key',
    severity: 'high',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['datadog', 'dd_api', 'monitoring'],
    provider: 'DataDog',
    category: 'monitoring'
  },
  
  'newrelic_license_key': {
    pattern: /\b[0-9a-f]{40}\b/g,
    description: 'New Relic License Key',
    severity: 'high',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['newrelic', 'nr_license', 'monitoring'],
    provider: 'New Relic',
    category: 'monitoring'
  },
  
  'sentry_dsn': {
    pattern: /https:\/\/[0-9a-f]{32}@[^\/]+\/[0-9]+/g,
    description: 'Sentry DSN',
    severity: 'medium',
    confidence: 'high',
    provider: 'Sentry',
    category: 'monitoring'
  },
  
  'mixpanel_token': {
    pattern: /\b[0-9a-f]{32}\b/g,
    description: 'Mixpanel Token',
    severity: 'medium',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['mixpanel', 'analytics'],
    provider: 'Mixpanel',
    category: 'monitoring'
  }
};

/**
 * Security & Authentication Patterns
 */
export const SECURITY_PATTERNS = {
  'jwt_secret': {
    pattern: /\b[A-Za-z0-9+/]{32,}={0,2}\b/g,
    description: 'JWT Secret',
    severity: 'critical',
    confidence: 'medium',
    requiresEntropy: true,
    minEntropy: 4.0,
    contextKeywords: ['jwt', 'token', 'secret', 'sign'],
    variableNames: ['jwt_secret', 'jwtSecret', 'JWT_SECRET'],
    category: 'security'
  },
  
  'private_key': {
    pattern: /-----BEGIN[A-Z\s]+PRIVATE KEY-----[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----/g,
    description: 'Private Key (PEM format)',
    severity: 'critical',
    confidence: 'high',
    category: 'security'
  },
  
  'ssh_private_key': {
    pattern: /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----[\s\S]*?-----END (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/g,
    description: 'SSH Private Key',
    severity: 'critical',
    confidence: 'high',
    category: 'security'
  },
  
  'api_key_generic': {
    pattern: /\b[a-zA-Z0-9]{32,64}\b/g,
    description: 'Generic API Key',
    severity: 'medium',
    confidence: 'low',
    requiresEntropy: true,
    minEntropy: 4.8,
    contextKeywords: ['api', 'key', 'token', 'secret'],
    variableNames: ['api_key', 'apiKey', 'API_KEY', 'auth_token'],
    requiresContext: true,
    category: 'security'
  }
};

/**
 * Master pattern registry - combines all categories
 */
export const SECRET_PATTERNS = {
  ...AI_PATTERNS,
  ...CLOUD_PATTERNS,
  ...DEVOPS_PATTERNS,
  ...COMMUNICATION_PATTERNS,
  ...PAYMENT_PATTERNS,
  ...DATABASE_PATTERNS,
  ...EMAIL_PATTERNS,
  ...MONITORING_PATTERNS,
  ...SECURITY_PATTERNS
};

/**
 * Pattern metadata for extensibility
 */
export const PATTERN_METADATA = {
  categories: ['ai', 'cloud', 'devops', 'communication', 'payment', 'database', 'email', 'monitoring', 'security'],
  providers: {
    'OpenAI': { category: 'ai', criticality: 'high' },
    'Anthropic': { category: 'ai', criticality: 'high' },
    'AWS': { category: 'cloud', criticality: 'critical' },
    'Microsoft Azure': { category: 'cloud', criticality: 'critical' },
    'Google Cloud': { category: 'cloud', criticality: 'critical' },
    'GitHub': { category: 'devops', criticality: 'high' },
    'Stripe': { category: 'payment', criticality: 'critical' },
    'Slack': { category: 'communication', criticality: 'medium' }
  },
  severityLevels: ['critical', 'high', 'medium', 'low'],
  confidenceLevels: ['high', 'medium', 'low']
};

/**
 * Get patterns by category
 * @param {string} category - Category to filter by
 * @returns {Object} Filtered patterns
 */
export function getPatternsByCategory(category) {
  const filtered = {};
  Object.entries(SECRET_PATTERNS).forEach(([key, pattern]) => {
    if (pattern.category === category) {
      filtered[key] = pattern;
    }
  });
  return filtered;
}

/**
 * Get patterns by provider
 * @param {string} provider - Provider to filter by
 * @returns {Object} Filtered patterns
 */
export function getPatternsByProvider(provider) {
  const filtered = {};
  Object.entries(SECRET_PATTERNS).forEach(([key, pattern]) => {
    if (pattern.provider === provider) {
      filtered[key] = pattern;
    }
  });
  return filtered;
}

/**
 * Get pattern statistics
 * @returns {Object} Statistics about patterns
 */
export function getPatternStats() {
  const patterns = Object.keys(SECRET_PATTERNS);
  const stats = {
    total: patterns.length,
    byCategory: {},
    byProvider: {},
    bySeverity: {},
    byConfidence: {}
  };
  
  patterns.forEach(key => {
    const pattern = SECRET_PATTERNS[key];
    
    // Count by category
    stats.byCategory[pattern.category] = (stats.byCategory[pattern.category] || 0) + 1;
    
    // Count by provider
    if (pattern.provider) {
      stats.byProvider[pattern.provider] = (stats.byProvider[pattern.provider] || 0) + 1;
    }
    
    // Count by severity
    stats.bySeverity[pattern.severity] = (stats.bySeverity[pattern.severity] || 0) + 1;
    
    // Count by confidence
    stats.byConfidence[pattern.confidence] = (stats.byConfidence[pattern.confidence] || 0) + 1;
  });
  
  return stats;
} 