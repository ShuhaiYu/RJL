// src/components/EditAgencyModal.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddressInput from "../../../components/custom/AddressInput";

export default function EditAgencyModal({ agency, onClose, onUpdated }) {
  const [agencyName, setAgencyName] = useState(agency.agency_name || "");
  const [address, setAddress] = useState(agency.address || "");
  const [phone, setPhone] = useState(agency.phone || "");
  const [logo, setLogo] = useState(agency.logo || "");
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const handleSave = async () => {
    try {
      const payload = {
        agency_name: agencyName,
        address,
        phone,
        logo,
      };
      const res = await axios.put(`${baseApi}/agencies/${agency.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Agency updated successfully");
      onUpdated && onUpdated(res.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update agency");
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Agency</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Agency Name</label>
              <Input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Enter agency name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <AddressInput
                value={address}
                onChange={(formattedAddress) => setAddress(formattedAddress)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Logo URL</label>
              <Input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="Enter logo URL"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
