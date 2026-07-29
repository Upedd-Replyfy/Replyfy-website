export default function DataTable({ columns, rows, emptyMessage = 'No data found' }) {
  if (!rows?.length) {
    return (
      <div className="luxury-card flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="luxury-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold text-ink">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row._id || i}
                className="border-b border-border last:border-0 hover:bg-surface/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-muted">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
