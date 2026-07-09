import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { DataTable } from '../../components/layouts/DashboardShell'
import { adminApi } from '../../services/api'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ limit: 50, role: 'user' }),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated')
    },
  })

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            row.isActive
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-white/[0.08] bg-white/[0.04] text-muted'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => toggleMutation.mutate(row._id)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Directory"
        title="Users"
        description="Manage platform user accounts"
      />
      {isLoading ? (
        <div className="admin-panel h-40 animate-pulse rounded-[20px] bg-[#202323]" />
      ) : (
        <DataTable columns={columns} rows={usersData?.users || []} emptyMessage="No users found" />
      )}
    </div>
  )
}
