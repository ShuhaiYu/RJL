import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { CardProjectExtended, CardProjectExtendedRow } from '@/partials/cards';
import axios from 'axios';
import { useAuthContext } from '@/auth';
const Agencies = () => {
  const [activeView, setActiveView] = useState('cards');
  const [agencies, setAgencies] = useState([]);

  // 从 useAuthContext 中取出 token
  const auth = useAuthContext().auth
  const token = auth?.accessToken

  useEffect(() => {    
    // 发起请求获取 agencies
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/admin/agencies`, {
        headers: {
          // Bearer Token形式
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {        
        setAgencies((response.data || []).filter((agency) => agency.is_actived));        
      })
      .catch((err) => {
        console.error('Failed to fetch agencies:', err)
      })
  }, [token])

  const handleRemove = (deletedId) => {
    setAgencies((prevAgencies) =>
      prevAgencies.filter((agency) => agency.id !== deletedId)
    );
  };
  
  const renderProject = (project, index) => {
    return <CardProjectExtended id={project.id} status={project.status} logo={project.logo} title={project.agency_name} description={project.address} team={project.team} statistics={project.statistics} progress={project.progress} url="#" key={index} onRemove={handleRemove}/>;
  };
  const renderItem = (item, index) => {
    return <CardProjectExtendedRow id={item.id} status={item.status} logo={item.logo} title={item.agency_name} description={item.address} team={item.team} statistics={item.statistics} url="#" key={index} />;
  };
  return <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
      <div className="flex flex-wrap items-center gap-5 justify-between">
        <h3 className="text-lg text-gray-900 font-semibold">{agencies.length} Agencies</h3>

        <div className="btn-tabs" data-tabs="true">
          <a href="#" className={`btn btn-icon ${activeView === 'cards' ? 'active' : ''}`} data-tab-toggle="#projects_cards" onClick={() => {
          setActiveView('cards');
        }}>
            <KeenIcon icon="category" />
          </a>
          <a href="#" className={`btn btn-icon ${activeView === 'list' ? 'active' : ''}`} data-tab-toggle="#projects_list" onClick={() => {
          setActiveView('list');
        }}>
            <KeenIcon icon="row-horizontal" />
          </a>
        </div>
      </div>

      {activeView === 'cards' && <div id="projects_cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7.5">
            {agencies.map((project, index) => {
          return renderProject(project, index);
        })}
          </div>

          {/* <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <a href="#" className="btn btn-link">
              Show more projects
            </a>
          </div> */}
        </div>}

      {activeView === 'list' && <div id="projects_list">
          <div className="flex flex-col gap-5 lg:gap-7.5">
            {agencies.map((item, index) => {
          return renderItem(item, index);
        })}
          </div>

          {/* <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <a href="#" className="btn btn-link">
              Show more projects
            </a>
          </div> */}
        </div>}
    </div>;
};
export { Agencies };