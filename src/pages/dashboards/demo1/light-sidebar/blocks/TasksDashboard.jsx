// src/pages/Dashboard/blocks/TasksDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthContext } from "@/auth";
import Chart from "react-apexcharts";
import { KeenIcon } from "@/components/keenicons";

// 定义颜色样式 - 使用 Tailwind 配置中的颜色
const statusColorClasses = {
  UNKNOWN: "bg-dashboard-unknown-light text-dashboard-unknown-text border-dashboard-unknown-border",
  INCOMPLETE: "bg-dashboard-incomplete-light text-dashboard-incomplete-text border-dashboard-incomplete-border",
  PROCESSING: "bg-dashboard-processing-light text-dashboard-processing-text border-dashboard-processing-border",
  COMPLETED: "bg-dashboard-completed-light text-dashboard-completed-text border-dashboard-completed-border",
  DUE_SOON: "bg-dashboard-dueSoon-light text-dashboard-dueSoon-text border-dashboard-dueSoon-border",
  EXPIRED: "bg-dashboard-expired-light text-dashboard-expired-text border-dashboard-expired-border",
  AGENCY: "bg-dashboard-agency-light text-dashboard-agency-text border-dashboard-agency-border",
  PROPERTY: "bg-dashboard-property-light text-dashboard-property-text border-dashboard-property-border",
};

// 颜色定义已移至 tailwind.config.js 中的 dashboard 配置

// 获取Tailwind配置中的颜色值 - 这些颜色现在定义在 tailwind.config.js 的 chart 配置中
const getChartColors = () => {
  // 这些颜色值对应 tailwind.config.js 中的 colors.chart 配置
  return {
    text: 'rgb(55, 65, 81)', // text-gray-700
    white: 'rgb(255, 255, 255)', // white
    primary: 'rgb(59, 130, 246)', // blue-500
    success: 'rgb(16, 185, 129)', // emerald-500
    border: 'rgb(241, 245, 249)', // slate-100
    stroke: 'rgb(229, 231, 235)', // gray-200
    backgroundLight: 'rgb(249, 250, 251)', // gray-50
    backgroundLighter: 'rgb(243, 244, 246)' // gray-100
  };
};

// 获取状态对应的颜色值 - 用于图表数据
const getStatusColor = (status) => {
  const colorMap = {
    UNKNOWN: '#f59e0b',
    INCOMPLETE: '#ea580c', 
    PROCESSING: '#0284c7',
    COMPLETED: '#059669',
    DUE_SOON: '#dc2626',
    EXPIRED: '#b91c1c',
    AGENCY: '#4f46e5',
    PROPERTY: '#6b7280'
  };
  return colorMap[status] || colorMap.UNKNOWN;
};

// 获取状态对应的Tailwind类名
const getStatusClasses = (status) => {
  const statusMap = {
    UNKNOWN: {
      bgLight: 'bg-dashboard-unknown-light',
      text: 'text-dashboard-unknown',
      border: 'border-l-dashboard-unknown'
    },
    INCOMPLETE: {
      bgLight: 'bg-dashboard-incomplete-light',
      text: 'text-dashboard-incomplete',
      border: 'border-l-dashboard-incomplete'
    },
    PROCESSING: {
      bgLight: 'bg-dashboard-processing-light',
      text: 'text-dashboard-processing',
      border: 'border-l-dashboard-processing'
    },
    COMPLETED: {
      bgLight: 'bg-dashboard-completed-light',
      text: 'text-dashboard-completed',
      border: 'border-l-dashboard-completed'
    },
    DUE_SOON: {
      bgLight: 'bg-dashboard-dueSoon-light',
      text: 'text-dashboard-dueSoon',
      border: 'border-l-dashboard-dueSoon'
    },
    EXPIRED: {
      bgLight: 'bg-dashboard-expired-light',
      text: 'text-dashboard-expired',
      border: 'border-l-dashboard-expired'
    },
    AGENCY: {
      bgLight: 'bg-dashboard-agency-light',
      text: 'text-dashboard-agency',
      border: 'border-l-dashboard-agency'
    },
    PROPERTY: {
      bgLight: 'bg-dashboard-property-light',
      text: 'text-dashboard-property',
      border: 'border-l-dashboard-property'
    }
  };
  return statusMap[status] || statusMap.UNKNOWN;
};

export default function TasksDashboard() {
  const navigate = useNavigate();
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const isAgencyUser = !!currentUser?.agency_id;

  // 添加加载状态
  const [loading, setLoading] = useState(true);

  // 定义统计数据初始值
  const [counts, setCounts] = useState({
    UNKNOWN: 0,
    INCOMPLETE: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    DUE_SOON: 0,
    EXPIRED: 0,
    AGENCY: 0,
    PROPERTY: 0,
  });

  // 根据用户角色设置卡片配置
  let cardConfigs = [];
  if (isAgencyUser) {
    // agency 用户显示：Incomplete, Processing, Completed, Due Soon, Expired, Properties
    cardConfigs = [
      { key: "INCOMPLETE", label: "Incomplete", route: "/property/tasks?status=INCOMPLETE" },
      { key: "PROCESSING", label: "Processing", route: "/property/tasks?status=PROCESSING" },
      { key: "COMPLETED", label: "Completed", route: "/property/tasks?status=COMPLETED" },
      { key: "DUE_SOON", label: "Due Soon", route: "/property/tasks?status=DUE_SOON" },
      { key: "EXPIRED", label: "Expired", route: "/property/tasks?status=EXPIRED" },
      { key: "PROPERTY", label: "Properties", route: "/property/my-properties" },
    ];
  } else {
    // admin/superuser显示：Unknown, Incomplete, Processing, Due Soon, Expired, Agencies, Properties
    cardConfigs = [
      { key: "UNKNOWN", label: "Unknown", route: "/property/tasks?status=UNKNOWN" },
      { key: "INCOMPLETE", label: "Incomplete", route: "/property/tasks?status=INCOMPLETE" },
      { key: "PROCESSING", label: "Processing", route: "/property/tasks?status=PROCESSING" },
      { key: "DUE_SOON", label: "Due Soon", route: "/property/tasks?status=DUE_SOON" },
      { key: "EXPIRED", label: "Expired", route: "/property/tasks?status=EXPIRED" },
      { key: "AGENCY", label: "Agencies", route: "/agencies/my-agencies" },
      { key: "PROPERTY", label: "Properties", route: "/property/my-properties" },
    ];
  }

  // 为不同状态设置不同的图标
  const getStatusIcon = (status) => {
    switch(status) {
      case 'UNKNOWN': return 'question';
      case 'INCOMPLETE': return 'time';
      case 'PROCESSING': return 'arrow-circle-right';
      case 'COMPLETED': return 'check';
      case 'DUE_SOON': return 'notification';
      case 'EXPIRED': return 'cross';
      case 'AGENCY': return 'office-bag';
      case 'PROPERTY': return 'home';
      default: return 'chart-line-up';
    }
  };

  const fetchCounts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${baseApi}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (isAgencyUser) {
        setCounts({
          UNKNOWN: 0,
          INCOMPLETE: parseInt(data.incomplete_count) || 0,
          PROCESSING: parseInt(data.processing_count) || 0,
          COMPLETED: parseInt(data.completed_count) || 0,
          DUE_SOON: parseInt(data.due_soon_count) || 0,
          EXPIRED: parseInt(data.expired_count) || 0,
          PROPERTY: parseInt(data.property_count) || 0,
        });
      } else {
        setCounts({
          UNKNOWN: parseInt(data.unknown_count) || 0,
          INCOMPLETE: parseInt(data.incomplete_count) || 0,
          PROCESSING: parseInt(data.processing_count) || 0,
          DUE_SOON: parseInt(data.due_soon_count) || 0,
          EXPIRED: parseInt(data.expired_count) || 0,
          AGENCY: parseInt(data.agency_count) || 0,
          PROPERTY: parseInt(data.property_count) || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [token]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  // 计算总数
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  // 准备图表数据 - 只显示有数据的项目
  const chartData = cardConfigs.map(item => ({
    label: item.label,
    value: counts[item.key] || 0,
    color: getStatusColor(item.key),
    route: item.route
  })).filter(item => item.value > 0);

  // 准备任务状态数据（排除AGENCY和PROPERTY）
  const taskStatusData = cardConfigs
    .filter(item => !['AGENCY', 'PROPERTY'].includes(item.key))
    .map(item => ({
      label: item.label,
      value: counts[item.key] || 0,
      color: getStatusColor(item.key),
      route: item.route
    }))
    .filter(item => item.value > 0);

  // 准备资源数据（AGENCY和PROPERTY）
  const resourceData = cardConfigs
    .filter(item => ['AGENCY', 'PROPERTY'].includes(item.key))
    .map(item => ({
      label: item.label,
      value: counts[item.key] || 0,
      color: getStatusColor(item.key),
      route: item.route
    }))
    .filter(item => item.value > 0);

  // 环形图配置（任务状态）
  const donutChartOptions = {
    chart: {
      type: 'donut',
      height: 300,
      toolbar: {
        show: false
      }
    },
    labels: taskStatusData.map(item => item.label),
    colors: taskStatusData.map(item => item.color),
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'inherit',
      markers: {
        width: 6,
        height: 6,
        radius: 3
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Tasks',
              fontSize: '14px',
              fontWeight: 600,
              color: getChartColors().text,
              formatter: function (w) {
                const total = taskStatusData.reduce((sum, item) => sum + item.value, 0);
                return total.toLocaleString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tasks"
        }
      }
    }
  };

  const donutChartSeries = taskStatusData.map(item => item.value);

  // 水平柱状图配置（资源数据）
  const horizontalBarOptions = {
    chart: {
      type: 'bar',
      height: 200,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '60%',
        borderRadius: 6
      },
    },
    dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: [getChartColors().white]
        }
      },
    xaxis: {
      categories: resourceData.map(item => item.label),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'inherit'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'inherit'
        }
      }
    },
    fill: {
      opacity: 1,
      colors: resourceData.map(item => item.color)
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " items"
        }
      }
    },
    grid: {
      show: false
    }
  };

  const horizontalBarSeries = [{
    name: 'Count',
    data: resourceData.map(item => item.value)
  }];

  // 面积图配置（趋势展示）
  const areaChartOptions = {
    chart: {
      type: 'area',
      height: 280,
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: chartData.map(item => item.label),
      labels: {
        style: {
          fontSize: '11px',
          fontFamily: 'inherit'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '11px',
          fontFamily: 'inherit'
        }
      }
    },
    colors: [getChartColors().primary],
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " items"
        }
      }
    },
    grid: {
      borderColor: getChartColors().border,
      strokeDashArray: 3
    }
  };

  const areaChartSeries = [{
    name: 'Items',
    data: chartData.map(item => item.value)
  }];

  // 雷达图配置
  const radarChartOptions = {
    chart: {
      type: 'radar',
      height: 300,
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: taskStatusData.map(item => item.label),
      labels: {
        style: {
          fontSize: '11px',
          fontFamily: 'inherit'
        }
      }
    },
    yaxis: {
      show: false
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: getChartColors().stroke,
          fill: {
            colors: [getChartColors().backgroundLight, getChartColors().backgroundLighter]
          }
        }
      }
    },
    colors: [getChartColors().success],
    markers: {
      size: 4,
      colors: [getChartColors().success],
      strokeColor: getChartColors().white,
      strokeWidth: 2
    },
    fill: {
      opacity: 0.2
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tasks"
        }
      }
    }
  };

  const radarChartSeries = [{
    name: 'Task Status',
    data: taskStatusData.map(item => item.value)
  }];

  // 柱状图配置
  const barChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartData.map(item => item.label),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'inherit'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Count',
        style: {
          fontSize: '12px',
          fontFamily: 'inherit'
        }
      }
    },
    fill: {
      opacity: 1,
      colors: chartData.map(item => item.color)
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " items"
        }
      }
    },
    grid: {
      borderColor: getChartColors().border,
      strokeDashArray: 3
    }
  };

  const barChartSeries = [{
    name: 'Count',
    data: chartData.map(item => item.value)
  }];

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back. Let's get back to work.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <KeenIcon icon="calendar" className="text-lg" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <KeenIcon icon="chart-pie-simple" className="text-2xl text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-green-600 font-medium">+15%</span>
            <span className="text-gray-500 ml-1">This Week</span>
          </div>
        </div>

        {cardConfigs.slice(0, 3).map((item) => {
          const count = counts[item.key] || 0;
          const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
          
          return (
            <div
              key={item.key}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => handleCardClick(item.route)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusClasses(item.key).bgLight}`}>
                  <KeenIcon icon={getStatusIcon(item.key)} className={`text-2xl ${getStatusClasses(item.key).text}`} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className={`font-medium ${getStatusClasses(item.key).text}`}>
                  {percentage}%
                </span>
                <span className="text-gray-500 ml-1">of total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* 环形图 - 任务状态 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Task status distribution</h3>
            <KeenIcon icon="chart-pie-simple" className="text-gray-400 text-xl" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                
              </div>
            </div>
          ) : taskStatusData.length > 0 ? (
            <Chart
              options={donutChartOptions}
              series={donutChartSeries}
              type="donut"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <KeenIcon icon="chart-pie-simple" className="text-gray-300 text-4xl mb-2" />
                <p className="text-sm text-gray-500">No task data available</p>
              </div>
            </div>
          )}
        </div>

        {/* 水平柱状图 - 资源数据 */}
        {(loading || resourceData.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Resource Statistics</h3>
              <KeenIcon icon="chart-line-up-2" className="text-gray-400 text-xl" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

                </div>
              </div>
            ) : resourceData.length > 0 ? (
              <Chart
                options={horizontalBarOptions}
                series={horizontalBarSeries}
                type="bar"
                height={200}
              />
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <KeenIcon icon="chart-line-up-2" className="text-gray-300 text-4xl mb-2" />
                  <p className="text-sm text-gray-500">No resource data available</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 雷达图 - 任务状态雷达 */}
        {(loading || taskStatusData.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mission Status Radar</h3>
              <KeenIcon icon="radar" className="text-gray-400 text-xl" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

                </div>
              </div>
            ) : taskStatusData.length > 0 ? (
              <Chart
                options={radarChartOptions}
                series={radarChartSeries}
                type="radar"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <KeenIcon icon="radar" className="text-gray-300 text-4xl mb-2" />
                  <p className="text-sm text-gray-500">No radar data available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 面积图 - 全数据趋势 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Data Trend Overview</h3>
          <KeenIcon icon="chart-line" className="text-gray-400 text-xl" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

            </div>
          </div>
        ) : chartData.length > 0 ? (
          <Chart
            options={areaChartOptions}
            series={areaChartSeries}
            type="area"
            height={280}
          />
        ) : (
          <div className="flex items-center justify-center h-[280px]">
            <div className="text-center">
              <KeenIcon icon="chart-line" className="text-gray-300 text-4xl mb-2" />
              <p className="text-sm text-gray-500">No trend data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Cards Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Breakdown</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cardConfigs.map((item) => {
            const count = counts[item.key] || 0;
            const percentage = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
            return (
              <div
                key={item.key}
                className={`p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-200 border-l-4 ${getStatusClasses(item.key).border}`}
                onClick={() => handleCardClick(item.route)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{item.label}</h4>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusClasses(item.key).bgLight}`}>
                    <span className={`text-xs font-bold ${getStatusClasses(item.key).text}`}>
                      {count}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{percentage}% of total</span>
                  <KeenIcon icon="arrow-right" className="text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
