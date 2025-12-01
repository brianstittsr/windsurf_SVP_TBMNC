/**
 * AI Service Configuration
 * Manages AI provider settings and feature flags
 */

export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'anthropic' | 'google' | 'azure';
  temperature: number;
  maxRetries: number;
  
  // Provider-specific configs
  openai?: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  
  anthropic?: {
    apiKey: string;
    model: string;
  };
  
  google?: {
    apiKey: string;
    model: string;
  };
  
  azure?: {
    apiKey: string;
    endpoint: string;
    deployment: string;
  };
  
  // Feature flags
  features: {
    riskAssessment: boolean;
    assignmentRecommendations: boolean;
    timelinePredictions: boolean;
    documentAnalysis: boolean;
    smartAlerts: boolean;
    pmiInsights: boolean;
  };
}

export const getAIConfig = (): AIConfig => {
  return {
    enabled: process.env.AI_ENABLED === 'true',
    provider: (process.env.AI_PROVIDER as any) || 'openai',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
    
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
    },
    
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
    },
    
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
    },
    
    azure: {
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
    },
    
    features: {
      riskAssessment: process.env.AI_RISK_ASSESSMENT === 'true',
      assignmentRecommendations: process.env.AI_ASSIGNMENT_RECOMMENDATIONS === 'true',
      timelinePredictions: process.env.AI_TIMELINE_PREDICTIONS === 'true',
      documentAnalysis: process.env.AI_DOCUMENT_ANALYSIS === 'true',
      smartAlerts: process.env.AI_SMART_ALERTS === 'true',
      pmiInsights: process.env.AI_PMI_INSIGHTS === 'true',
    },
  };
};

export const isFeatureEnabled = (feature: keyof AIConfig['features']): boolean => {
  const config = getAIConfig();
  return config.enabled && config.features[feature];
};
