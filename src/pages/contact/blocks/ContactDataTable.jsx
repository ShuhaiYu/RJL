import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { toast } from "sonner";
import axios from "axios";

export default function ContactDataTable({
  contacts,
  onEdit,
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

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await axios.delete(`/api/contacts/${contactId}`);
      toast.success("Contact deleted successfully!");
      // 如有需要，可调用 onFilteredDataChange 刷新表格数据
      if (onFilteredDataChange) onFilteredDataChange();
    } catch (error) {
      console.error("Delete contact error:", error);
      toast.error("Failed to delete contact");
    }
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
                onClick={() => handleDelete(contact.id)}
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
