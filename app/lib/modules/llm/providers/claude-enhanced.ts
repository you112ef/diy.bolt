import { BaseProvider } from '../base-provider';
import type { ModelInfo } from '../types';
import type { IProviderSetting } from '~/types/model';

export default class ClaudeEnhancedProvider extends BaseProvider {
  name = 'Claude Enhanced';
  getApiKeyLink = 'https://console.anthropic.com/settings/keys';

  config = {
    apiTokenKey: 'ANTHROPIC_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'claude-3-5-sonnet-20241022',
      label: 'Claude 3.5 Sonnet (Latest)',
      provider: 'Claude Enhanced',
      maxTokenAllowed: 8000,
    },
    {
      name: 'claude-3-5-haiku-20241022',
      label: 'Claude 3.5 Haiku (Fast)',
      provider: 'Claude Enhanced',
      maxTokenAllowed: 8000,
    },
    {
      name: 'claude-3-opus-20240229',
      label: 'Claude 3 Opus (Most Capable)',
      provider: 'Claude Enhanced',
      maxTokenAllowed: 4000,
    },
    {
      name: 'claude-3-sonnet-20240229',
      label: 'Claude 3 Sonnet (Balanced)',
      provider: 'Claude Enhanced',
      maxTokenAllowed: 4000,
    },
    {
      name: 'claude-3-haiku-20240307',
      label: 'Claude 3 Haiku (Fast & Efficient)',
      provider: 'Claude Enhanced',
      maxTokenAllowed: 4000,
    },
  ];

  getModelList(options: { apiKeys?: Record<string, string>; providerSettings?: Record<string, IProviderSetting> }) {
    return this.staticModels.filter((model) => {
      const apiKey = options.apiKeys?.[this.config.apiTokenKey!];
      const providerSettings = options.providerSettings?.[this.name];
      
      return apiKey && providerSettings?.enabled !== false;
    });
  }
}