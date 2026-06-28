import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../services/api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.categories || [],
  })
}

export function useExpertTypes(categoryId, enabled = true) {
  return useQuery({
    queryKey: ['expert-types', categoryId],
    queryFn: () => catalogApi.getExpertTypes(categoryId),
    enabled: !!categoryId && enabled,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.expertTypes || [],
  })
}

export function useExperts(params, enabled = true) {
  return useQuery({
    queryKey: ['experts', params],
    queryFn: () => catalogApi.getExperts(params),
    enabled,
    select: (data) => ({
      experts: data.experts || [],
      pagination: data.pagination,
    }),
  })
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: catalogApi.getStats,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.stats,
  })
}
