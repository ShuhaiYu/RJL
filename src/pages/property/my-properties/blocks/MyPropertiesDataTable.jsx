// src/pages/MyPropertiesDataTable.jsx

import { useMemo } from 'react'
// 假设你有一个封装好的 DataGrid
import { DataGrid } from '@/components/data-grid'  

export default function MyPropertiesDataTable({ properties, onEdit }) {
  // 定义 DataGrid 的列
  const columns = useMemo(() => [
    {
      accessorKey: 'address',
      header: 'Address',
    },
    {
      id: 'agency_name',
      header: 'Agency',
      // accessorFn 可以从 row.user?.agency?.agency_name 中取值
      accessorFn: (row) => row.agency?.agency_name || 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const property = row.original
        return (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => onEdit(property.id)}
          >
            <i className="ki-outline ki-notepad-edit"></i> Edit
          </button>
        )
      },
    },
  ], [onEdit])

  return (
    <DataGrid
      columns={columns}
      data={properties}
      serverSide={false}   // 前端分页/排序
      rowSelection={false} // 不需要选择行
      // 其它 DataGrid 配置，如 toolbar, pagination, etc.
      // pagination={{ size: 5, sizes: [5,10,20], ... }}
    />
  )
}
