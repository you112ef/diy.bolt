import { BaseProvider } from '../base-provider';
import type { ModelInfo } from '../types';
import type { IProviderSetting } from '~/types/model';

export default class GPTEnhancedProvider extends BaseProvider {
  name = 'GPT Enhanced';
  getApiKeyLink = 'https://platform.openai.com/api-keys';

  config = {
    apiTokenKey: 'OPENAI_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'gpt-4o',
      label: 'GPT-4o (Omni)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 4000,
    },
    {
      name: 'gpt-4o-mini',
      label: 'GPT-4o Mini (Fast)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 16000,
    },
    {
      name: 'gpt-4-turbo',
      label: 'GPT-4 Turbo (Latest)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 4000,
    },
    {
      name: 'gpt-4-turbo-preview',
      label: 'GPT-4 Turbo Preview',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 4000,
    },
    {
      name: 'gpt-4',
      label: 'GPT-4 (Standard)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 8000,
    },
    {
      name: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo (Cost Effective)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 4000,
    },
    {
      name: 'o1-preview',
      label: 'o1 Preview (Reasoning)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 32000,
    },
    {
      name: 'o1-mini',
      label: 'o1 Mini (Fast Reasoning)',
      provider: 'GPT Enhanced',
      maxTokenAllowed: 65000,
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