import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { KeenIcon } from "@/components/keenicons";
import { useAuthContext } from '@/auth';
import axios from 'axios';

const RecentData = () => {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  
  const [recentData, setRecentData] = useState({
    tasks: [],
    contacts: [],
    properties: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    const fetchRecentData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        
        // Fetch recent data in parallel
        const requests = [
          axios.get(`${baseApi}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
            params: currentUser?.agency_id ? { agency_id: currentUser.agency_id } : {}
          }),
          axios.get(`${baseApi}/contacts`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseApi}/properties`, {
            headers: { Authorization: `Bearer ${token}` },
            params: currentUser?.agency_id ? { agency_id: currentUser.agency_id } : {}
          })
        ];

        const [tasksResponse, contactsResponse, propertiesResponse] = await Promise.all(requests);
        
        // Process task data - get recent 5
        const tasks = Array.isArray(tasksResponse.data) 
          ? tasksResponse.data
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
          : [];

        // Process contact data - get recent 5
        const contacts = Array.isArray(contactsResponse.data)
          ? contactsResponse.data
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
          : [];

        // Process property data - get recent 5
        const properties = Array.isArray(propertiesResponse.data)
          ? propertiesResponse.data
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5)
          : [];

        setRecentData({ tasks, contacts, properties });
      } catch (error) {
        console.error('Failed to fetch recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, [token, baseApi, currentUser?.agency_id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('zh-CN');
  };

  const getStatusColor = (status) => {
    const colors = {
      'COMPLETED': 'text-green-600 bg-green-50',
      'PROCESSING': 'text-blue-600 bg-blue-50',
      'INCOMPLETE': 'text-orange-600 bg-orange-50',
      'UNKNOWN': 'text-gray-600 bg-gray-50',
      'DUE_SOON': 'text-red-600 bg-red-50',
      'EXPIRED': 'text-red-700 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: 'task-square', count: recentData.tasks.length },
    { id: 'contacts', label: 'Contacts', icon: 'people', count: recentData.contacts.length },
    { id: 'properties', label: 'Properties', icon: 'home-2', count: recentData.properties.length }
  ];

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
            <KeenIcon icon="time" className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Data</h3>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-12 bg-gray-200 rounded-md"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderTaskItem = (task) => (
    <div key={task.id} className="p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <KeenIcon icon="task-square" className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="font-medium text-gray-800 truncate">
              {task.title || `#${task.id}`}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.status && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              )}
              <Link 
                to={`/property/tasks/${task.id}`}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <KeenIcon icon="arrow-right" />
              </Link>
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            {task.property_address && (
              <div className="flex items-start gap-1">
                <KeenIcon icon="geolocation" className="text-xs mt-0.5 flex-shrink-0" />
                <span className="break-words">{task.property_address}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1">
                <KeenIcon icon="calendar" className="text-xs flex-shrink-0" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactItem = (contact) => (
    <div key={contact.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
          <KeenIcon icon="user" className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{contact.name}</h4>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {contact.phone && (
              <span className="flex items-center gap-1">
                <KeenIcon icon="phone" className="text-xs" />
                {contact.phone}
              </span>
            )}
            {contact.email && (
              <span className="flex items-center gap-1">
                <KeenIcon icon="sms" className="text-xs" />
                {contact.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPropertyItem = (property) => (
    <div key={property.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
          <KeenIcon icon="home-2" className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{property.address}</h4>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <KeenIcon icon="tag" className="text-xs" />
              ID: {property.id}
            </span>
            {property.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {property.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    const data = recentData[activeTab];
    
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeenIcon icon="file-empty" className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-500">No recent data</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'tasks':
        return data.map(renderTaskItem);
      case 'contacts':
        return data.map(renderContactItem);
      case 'properties':
        return data.map(renderPropertyItem);
      default:
        return null;
    }
  };

  return (
    <div className="card p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg">
            <KeenIcon icon="time" className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Data</h3>
        </div>
        
        {/* 垂直标签页导航 */}
        <div className="flex flex-col gap-1 bg-gray-50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <KeenIcon icon={tab.icon} className="text-xs" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ml-auto ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default RecentData;