import { Link } from 'react-router-dom';
import { KeenIcon } from "@/components/keenicons";
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/auth';
import axios from 'axios';
import { TimelinesWrapper } from '@/partials/timelines/default/item';

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;

  useEffect(() => {
    const fetchUserActivities = async () => {
      if (!token || !currentUser) return;
      
      try {
        setLoading(true);
        
        // 并行获取用户相关的数据来构建活动时间线
        const [tasksResponse, contactsResponse, propertiesResponse] = await Promise.all([
          axios.get(`${baseApi}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          axios.get(`${baseApi}/contacts`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] })),
          axios.get(`${baseApi}/properties`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] }))
        ]);

        const userActivities = [];

        // 从任务数据中提取活动
        if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
          tasksResponse.data
            .filter(task => task.created_by === currentUser.id || task.assigned_to === currentUser.id)
            .slice(0, 5) // 增加到5个任务
            .forEach(task => {
              userActivities.push({
                id: `task-${task.id}`,
                type: 'task',
                icon: 'notepad-edit',
                title: `创建了任务: ${task.task_name}`,
                description: `状态: ${task.status}`,
                datetime: task.created_at,
                link: `/property/tasks/${task.id}`
              });
            });
        }

        // 从联系人数据中提取活动
        if (contactsResponse.data && Array.isArray(contactsResponse.data)) {
          contactsResponse.data
            .slice(0, 4) // 增加到4个联系人
            .forEach(contact => {
              userActivities.push({
                id: `contact-${contact.id}`,
                type: 'contact',
                icon: 'people',
                title: `添加了联系人: ${contact.name}`,
                description: `邮箱: ${contact.email}`,
                datetime: contact.created_at,
                link: `/contact/${contact.id}`
              });
            });
        }

        // 从属性数据中提取活动
        if (propertiesResponse.data && Array.isArray(propertiesResponse.data)) {
          propertiesResponse.data
            .slice(0, 4) // 增加到4个属性
            .forEach(property => {
              userActivities.push({
                id: `property-${property.id}`,
                type: 'property',
                icon: 'home-2',
                title: ` ${property.address}`,
                description: `Type: ${property.property_type || 'None'}`,
                datetime: property.created_at,
                link: `/property/${property.id}`
              });
            });
        }

        // 添加用户登录活动（基于用户的最后登录时间）
        if (currentUser.last_login) {
          userActivities.push({
            id: 'login',
            type: 'login',
            icon: 'entrance-left',
            title: '最近登录系统',
            description: '用户门户',
            datetime: currentUser.last_login,
            link: null
          });
        }

        // 按时间排序（最新的在前）
        userActivities.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        
        setActivities(userActivities.slice(0, 8)); // 增加到显示最近8个活动
      } catch (error) {
        console.error('获取用户活动失败:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivities();
  }, [token, currentUser, baseApi]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '未知时间';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '刚刚';
    if (diffInHours < 24) return `${diffInHours} 小时前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} 天前`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} 周前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const ActivityItem = ({ activity }) => (
    <TimelinesWrapper icon={activity.icon} line={true}>
      <div className="flex flex-col">
        <div className="text-sm text-gray-800">
          {activity.link ? (
            <Link to={activity.link} className="text-sm link hover:text-blue-600">
              {activity.title}
            </Link>
          ) : (
            activity.title
          )}
        </div>
        {activity.description && (
          <div className="text-xs text-gray-500 mt-1">{activity.description}</div>
        )}
        <span className="text-xs text-gray-600 mt-1">
          {formatDateTime(activity.datetime)}
        </span>
      </div>
    </TimelinesWrapper>
  );

  return (
    <div className="card bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="card-header border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <KeenIcon icon="chart-line-up" className="text-blue-600 text-lg" />
          </div>
          <h3 className="card-title text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>

        <div className="flex items-center gap-2">
          <label className="switch">
            <span className="switch-label text-sm text-gray-600">
              Auto Refresh:&nbsp;
              <span className="switch-on:hidden">off</span>
              <span className="hidden switch-on:inline">on</span>
            </span>
            <input type="checkbox" value="1" name="check" defaultChecked readOnly />
          </label>
        </div>
      </div>

      <div className="card-body p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <KeenIcon icon="file-empty" className="text-4xl mb-2" />
            <p>暂无活动记录</p>
          </div>
        )}
      </div>

      <div className="card-footer border-t border-gray-100 p-6 flex justify-center">
        <Link 
          to="/public-profile/activity" 
          className="btn btn-link flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <KeenIcon icon="arrow-right" className="text-base" />
          View All Activities
        </Link>
      </div>
    </div>
  );
};
export { Activity };