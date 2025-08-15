import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeenIcon } from "@/components/keenicons";
import { useAuthContext } from '@/auth';
import axios from 'axios';

const StatsOverview = () => {
  const navigate = useNavigate();
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const isAgencyUser = !!currentUser?.agency_id;
  
  const [stats, setStats] = useState({
    incomplete: 0,
    processing: 0,
    completed: 0,
    properties: 0,
    contacts: 0,
    agencies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        
        // 并行请求多个接口获取统计数据
        const requests = [
          axios.get(`${baseApi}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseApi}/contacts`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ];

        const [dashboardResponse, contactsResponse] = await Promise.all(requests);
        
        const dashboardData = dashboardResponse.data;
        const contactsCount = Array.isArray(contactsResponse.data) ? contactsResponse.data.length : 0;
        
        setStats({
          incomplete: parseInt(dashboardData.incomplete_count) || 0,
          processing: parseInt(dashboardData.processing_count) || 0,
          completed: parseInt(dashboardData.completed_count) || 0,
          properties: parseInt(dashboardData.property_count) || 0,
          contacts: contactsCount,
          agencies: parseInt(dashboardData.agency_count) || 0
        });
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, baseApi]);

  // 根据用户角色配置显示的统计卡片
  const getStatsCards = () => {
    const baseCards = [
      {
        key: 'incomplete',
        title: 'Incomplete',
        value: stats.incomplete,
        icon: 'time',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        route: '/property/tasks?status=INCOMPLETE'
      },
      {
        key: 'processing',
        title: 'Processing',
        value: stats.processing,
        icon: 'loading',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        route: '/property/tasks?status=PROCESSING'
      },
      {
        key: 'completed',
        title: 'Completed',
        value: stats.completed,
        icon: 'check-circle',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        route: '/property/tasks?status=COMPLETED'
      },
      {
        key: 'properties',
        title: 'Properties',
        value: stats.properties,
        icon: 'home-2',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        route: '/property/my-properties'
      },
      {
        key: 'contacts',
        title: 'Contacts',
        value: stats.contacts,
        icon: 'people',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        route: '/contacts'
      }
    ];

    // 如果不是机构用户，添加机构统计
    if (!isAgencyUser) {
      baseCards.push({
        key: 'agencies',
        title: 'Agencies',
        value: stats.agencies,
        icon: 'office-bag',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        route: '/agencies/my-agencies'
      });
    }

    return baseCards;
  };

  const handleCardClick = (route) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
            <KeenIcon icon="chart-pie-simple" className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Statistics Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-lg border bg-gray-50 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = getStatsCards();

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
          <KeenIcon icon="chart-pie-simple" className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Statistics Overview</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card) => (
          <div
            key={card.key}
            className={`p-6 rounded-lg border cursor-pointer transition-all duration-200 ${card.bgColor} hover:shadow-md`}
            onClick={() => handleCardClick(card.route)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${card.bgColor}`}>
                <KeenIcon icon={card.icon} className={`${card.color} text-lg`} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {card.value.toLocaleString()}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">{card.title}</div>
          </div>
        ))}
      </div>

      {/* 总任务数统计 */}
      {(stats.incomplete > 0 || stats.processing > 0 || stats.completed > 0) && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Tasks</span>
            <span className="font-semibold text-gray-800">
              {(stats.incomplete + stats.processing + stats.completed).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;