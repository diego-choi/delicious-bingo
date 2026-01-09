import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/endpoints';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templatesApi.getAll();
      return response.data;
    },
  });
}

export function useTemplate(id) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const response = await templatesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
