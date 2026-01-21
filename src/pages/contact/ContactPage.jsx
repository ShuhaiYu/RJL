import { useState, useEffect } from "react";
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
import ContactDataTable from "./blocks/ContactDataTable";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ContactPage() {
  const { auth, baseApi } = useAuthContext();
  const token = auth?.accessToken;

  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [filteredCount, setFilteredCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend returns { success: true, data: [...] }
      const contacts = response.data?.data || response.data || [];
      setContacts(Array.isArray(contacts) ? contacts : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  if (loading)
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );

  return (
    <div style={{ height: 600, width: "100%", padding: 20 }}>
      {/* Back button */}
      <button className="btn btn-secondary mb-6" onClick={() => navigate(-1)}>
        Back <i className="ki-filled ki-arrow-left"></i>
      </button>
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>

      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredCount} of {contacts.length} contacts
      </p>

      <ContactDataTable
        contacts={contacts}
        onEdit={(id) => {
          setSelectedContactId(id);
          setEditModalOpen(true);
        }}
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
