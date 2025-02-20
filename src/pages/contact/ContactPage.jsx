import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalContent,
} from "@/components/modal";
import { EditContactForm } from "./blocks/EditContactForm";
import { Button } from "@/components/ui/button";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Input } from "@/components/ui/input";

export const ContactPage = () => {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [filteredCount, setFilteredCount] = useState(0);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${baseApi}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

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
            <Button
              variant="edit"
              size="sm"
              onClick={() => {
                setSelectedContactId(contact.id);
                setEditModalOpen(true);
              }}
            >
              Edit
            </Button>
          );
        },
      },
    ];
  }, []);

  return (
    <div style={{ height: 600, width: "100%", padding: 20 }}>
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>

      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredCount} of {contacts.length} contacts
      </p>

      <DataGrid
        data={contacts}
        columns={columns}
        serverSide={false} // 前端分页、排序
        rowSelection={false} // 不需要多选行
        pagination={{ size: 100 }}
        onFilteredDataChange={(count) => setFilteredCount(count)}

      />

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Contact</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {selectedContactId && (
              <EditContactForm
                contactId={selectedContactId}
                onSuccess={() => {
                  setEditModalOpen(false);
                  fetchContacts();
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
