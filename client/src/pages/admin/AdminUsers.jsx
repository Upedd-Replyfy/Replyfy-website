import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { DashboardShell, DataTable } from '../../components/layouts/DashboardShell'
import { adminApi } from '../../services/api'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ limit: 50 }),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated')
    },
  })

  const nav = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/questions', label: 'Questions' },
    { to: '/admin/answers', label: 'Answers' },
    { to: '/admin/experts', label: 'Experts' },
    { to: '/admin/users', label: 'Users' },
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <span className={row.isActive ? 'text-ink' : 'text-muted'}>
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
          className="text-xs font-semibold text-ink underline"
        >
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ]

  return (
    <DashboardShell title="Users" nav={nav}>
      <h1 className="text-2xl font-semibold text-ink">Manage Users</h1>
      {isLoading ? (
        <div className="mt-6 luxury-card h-40 animate-pulse bg-surface" />
      ) : (
        <div className="mt-6">
          <DataTable columns={columns} rows={data?.users || []} emptyMessage="No users found" />
        </div>
      )}
    </DashboardShell>
  )
}
