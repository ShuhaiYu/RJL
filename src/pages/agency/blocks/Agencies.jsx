// src/pages/Agencies.jsx
import { useState, useEffect } from "react";
import { KeenIcon } from "@/components";
import { CardProjectExtended, CardProjectExtendedRow } from "@/partials/cards";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Box, CircularProgress } from "@mui/material";
import AgenciesMetricsDataGrid from "./AgenciesMetricsDataGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Agencies = () => {
  const [activeView, setActiveView] = useState("cards");
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 从 AuthContext 中获取 token 与基础 API 路径（例如：`${import.meta.env.VITE_API_BASE_URL}/superuser`）
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;

  const navigate = useNavigate();

  const fetchAgencies = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/agencies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgencies(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch agencies:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAgencies();
    }
  }, [token]);

  const handleRemove = (deletedId) => {
    setAgencies((prevAgencies) =>
      prevAgencies.filter((agency) => agency.id !== deletedId)
    );
  };

  // 使用卡片视图时，传入 id, logo, title（agency_name）, description（address）和 phone
  const renderProject = (agency, index) => {
    return (
      <CardProjectExtended
        id={agency.id}
        logo={agency.logo}
        title={agency.agency_name}
        description={agency.address}
        phone={agency.phone}
        url={`/agencies/${agency.id}`}
        key={index}
        onRemove={handleRemove}
      />
    );
  };

  // 列表视图：使用行卡片展示
  const renderItem = (agency, index) => {
    return (
      <CardProjectExtendedRow
        id={agency.id}
        logo={agency.logo}
        title={agency.agency_name}
        description={agency.address}
        phone={agency.phone}
        url={`/agencies/${agency.id}`}
        key={index}
      />
    );
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-40">
        <CircularProgress />
      </Box>
    );
  }

  const canCreateAgency = currentUser?.permissions?.agency?.includes("create");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Agencies</h1>
      <div className="flex flex-wrap items-center gap-5 justify-between">
        <h3 className="text-lg text-gray-900 font-semibold">
          {agencies.length} Agencies
        </h3>
        <div className="mb-4 flex justify-end">
          {canCreateAgency && (
            <Button
              variant="create"
              onClick={() => navigate("/agencies/create-agency")}
            >
              Create Agency
            </Button>
          )}
        </div>

        <AgenciesMetricsDataGrid agencies={agencies} />

        {/*<div className="btn-tabs" data-tabs="true">*/}
        {/*  <a*/}
        {/*    href="#"*/}
        {/*    className={`btn btn-icon ${activeView === 'cards' ? 'active' : ''}`}*/}
        {/*    data-tab-toggle="#projects_cards"*/}
        {/*    onClick={() => setActiveView('cards')}*/}
        {/*  >*/}
        {/*    <KeenIcon icon="category" />*/}
        {/*  </a>*/}
        {/*  <a*/}
        {/*    href="#"*/}
        {/*    className={`btn btn-icon ${activeView === 'list' ? 'active' : ''}`}*/}
        {/*    data-tab-toggle="#projects_list"*/}
        {/*    onClick={() => setActiveView('list')}*/}
        {/*  >*/}
        {/*    <KeenIcon icon="row-horizontal" />*/}
        {/*  </a>*/}
        {/*</div>*/}
      </div>

      {/*{activeView === 'cards' && (*/}
      {/*  <div id="projects_cards">*/}
      {/*    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">*/}
      {/*      {agencies.map((agency, index) => renderProject(agency, index))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/*{activeView === 'list' && (*/}
      {/*  <div id="projects_list">*/}
      {/*    <div className="flex flex-col gap-5 lg:gap-7.5">*/}
      {/*      {agencies.map((agency, index) => renderItem(agency, index))}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
};

export { Agencies };
