import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../services/api'
import { PLANS } from '../constants'

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
    queryKey: ['expert-types', categoryId || 'all'],
    queryFn: () => catalogApi.getExpertTypes(categoryId || undefined),
    enabled,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.expertTypes || [],
  })
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: catalogApi.getSettings,
    staleTime: 15 * 1000,
    select: (data) => ({
      mentorTypesEnabled: data?.settings?.mentorTypesEnabled === true,
    }),
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

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: catalogApi.getPlans,
    staleTime: 30 * 1000,
    placeholderData: { plans: Object.values(PLANS) },
    select: (data) => {
      const list = data?.plans
      if (Array.isArray(list) && list.length) return list
      return Object.values(PLANS)
    },
  })
}
