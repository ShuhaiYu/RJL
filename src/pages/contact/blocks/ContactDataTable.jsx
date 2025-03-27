import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";

export default function ContactDataTable({
  contacts,
  onEdit,
  onDelete,
  onFilteredDataChange,
}) {
  const ColumnInputFilter = ({ column }) => {
    return (
      <Input
        placeholder="Filter..."
        value={column.getFilterValue() ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Name"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "phone",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Phone"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Email"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "id",
        header: ({ header }) => (
          <DataGridColumnHeader column={header.column} title="Action" />
        ),
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="edit"
                size="sm"
                onClick={() => onEdit(contact.id)}
              >
                Edit
              </Button>
              <Button
                variant="delete"
                size="sm"
                onClick={() => onDelete(contact.id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ];
  }, [onEdit]);

  return (
    <DataGrid
      data={contacts}
      columns={columns}
      serverSide={false} // 前端分页、排序
      rowSelection={false} // 不需要多选行
      pagination={{ size: 100 }}
      onFilteredDataChange={onFilteredDataChange}
    />
  );
}
