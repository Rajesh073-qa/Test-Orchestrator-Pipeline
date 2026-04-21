import { api } from './api';

export const aiConfigApi = {
  getProviders: async () => {
    const { data } = await api.get('/ai-config/providers');
    return data;
  },
  getConfig: async () => {
    const { data } = await api.get('/ai-config');
    return data;
  },
  saveConfig: async (provider: string, model: string, apiKey: string) => {
    const { data } = await api.post('/ai-config', { provider, model, apiKey });
    return data;
  },
  deleteConfig: async () => {
    const { data } = await api.delete('/ai-config');
    return data;
  },
};
