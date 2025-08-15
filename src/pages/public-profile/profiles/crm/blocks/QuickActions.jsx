import { useNavigate } from 'react-router-dom';
import { KeenIcon } from "@/components/keenicons";
import { useAuthContext } from '@/auth';

const QuickActions = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const isAgencyUser = !!currentUser?.agency_id;

  // 根据用户权限配置快速操作
  const getQuickActions = () => {
    const baseActions = [
      {
        id: 'create-task',
        title: 'Create Task',
        description: 'Create new job order',
        icon: 'plus-circle',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100',
        route: '/property/tasks',
        permission: currentUser?.permissions?.task?.includes('create')
      },
      {
        id: 'add-contact',
        title: 'Add Contact',
        description: 'Add new contact',
        icon: 'address-book',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        hoverColor: 'hover:bg-green-100',
        route: '/contacts',
        permission: currentUser?.permissions?.contact?.includes('create')
      },
      {
        id: 'add-property',
        title: 'Add Property',
        description: 'Add new property',
        icon: 'home-2',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        hoverColor: 'hover:bg-purple-100',
        route: '/property/my-properties',
        permission: currentUser?.permissions?.property?.includes('create')
      },
      {
        id: 'view-dashboard',
        title: 'View Dashboard',
        description: 'Data analytics',
        icon: 'chart-line',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        hoverColor: 'hover:bg-orange-100',
        route: '/dashboards/demo1',
        permission: true
      }
    ];

    // 如果不是机构用户，添加机构管理
    if (!isAgencyUser) {
      baseActions.push({
        id: 'manage-agencies',
        title: 'Manage Agency',
        description: 'Agency management',
        icon: 'office-bag',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        hoverColor: 'hover:bg-indigo-100',
        route: '/agencies/my-agencies',
        permission: currentUser?.permissions?.agency?.includes('read')
      });
    }

    // 添加用户管理（仅管理员）
    if (currentUser?.permissions?.user?.includes('read')) {
      baseActions.push({
        id: 'manage-users',
        title: 'User Management',
        description: 'Manage users',
        icon: 'people',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        hoverColor: 'hover:bg-red-100',
        route: '/users',
        permission: true
      });
    }

    // 过滤掉没有权限的操作
    return baseActions.filter(action => action.permission);
  };

  const handleActionClick = (route) => {
    navigate(route);
  };

  const quickActions = getQuickActions();

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
          <KeenIcon icon="flash" className="text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.id}
            className={`p-6 rounded-lg border cursor-pointer transition-all duration-200 ${action.bgColor} ${action.hoverColor} hover:shadow-md`}
            onClick={() => handleActionClick(action.route)}
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${action.bgColor}`}>
                <KeenIcon icon={action.icon} className={`${action.color} text-xl`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
              <KeenIcon icon="arrow-right" className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;