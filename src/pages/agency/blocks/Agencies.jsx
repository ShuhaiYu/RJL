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
import { toast } from "sonner";
import StatsCards from "@/components/common/StatsCards";

const Agencies = () => {
  const [activeView, setActiveView] = useState("cards");
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agencyStats, setAgencyStats] = useState({
    total: 0,
    active: 0,
    filteredCount: 0
  });

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
      const data = response.data;
      setAgencies(data);
      
      // 计算统计信息
      const stats = {
        total: data.length,
        active: data.filter(agency => agency.status === 'active').length,
        filteredCount: data.length
      };
      setAgencyStats(stats);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch agencies:", err);
      toast.error("Failed to fetch agencies");
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
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <KeenIcon icon="office-bag" className="text-blue-600 text-lg" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Agency Management</h1>
            <p className="text-gray-600 mt-1">Manage agencies and their information</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg text-gray-900 font-semibold">
            {agencies.length} Agencies
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {canCreateAgency && (
            <Button
              variant="create"
              onClick={() => navigate("/agencies/create-agency")}
              className="flex items-center gap-2"
            >
              <KeenIcon icon="plus" className="text-sm" />
              Create Agency
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8">
        <StatsCards
          title="Agency Statistics"
          loading={loading}
          cards={[
          {
            key: 'total',
            title: 'Total Agencies',
            value: agencyStats.total,
            icon: 'office-bag',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            route: null
          },
          {
            key: 'active',
            title: 'Active Agencies',
            value: agencyStats.active,
            icon: 'check-circle',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            route: null
          },
          {
            key: 'filtered',
            title: 'Filtered Results',
            value: agencyStats.filteredCount,
            icon: 'filter',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            route: null
          }
        ]}
        />
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Agencies List</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {agencyStats.filteredCount} of {agencies.length} agencies
              </span>
              <div className="btn-tabs ml-4" data-tabs="true">
                <a
                  href="#"
                  className={`btn btn-icon ${activeView === 'cards' ? 'active' : ''}`}
                  data-tab-toggle="#projects_cards"
                  onClick={() => setActiveView('cards')}
                >
                  <KeenIcon icon="category" />
                </a>
                <a
                  href="#"
                  className={`btn btn-icon ${activeView === 'list' ? 'active' : ''}`}
                  data-tab-toggle="#projects_list"
                  onClick={() => setActiveView('list')}
                >
                  <KeenIcon icon="row-horizontal" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeView === 'cards' && (
            <div id="projects_cards">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
                {agencies.map((agency, index) => renderProject(agency, index))}
              </div>
            </div>
          )}

          {activeView === 'list' && (
            <div id="projects_list">
              <div className="flex flex-col gap-5 lg:gap-7.5">
                {agencies.map((agency, index) => renderItem(agency, index))}
              </div>
            </div>
          )}

          {agencies.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="office-bag" className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first agency.</p>
              {canCreateAgency && (
                <Button
                  variant="create"
                  onClick={() => navigate("/agencies/create-agency")}
                  className="flex items-center gap-2"
                >
                  <KeenIcon icon="plus" className="text-sm" />
                  Create Agency
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AgenciesMetricsDataGrid agencies={agencies} />
    </div>
  );
};

export { Agencies };
