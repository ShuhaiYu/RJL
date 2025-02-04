// ProfileCRMPage.jsx
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { toAbsoluteUrl } from '@/utils/Assets';
import { KeenIcon } from '@/components';
import { Container } from '@/components/container';
import { UserProfileHero } from '@/partials/heros';
import { Navbar, NavbarActions, NavbarDropdown } from '@/partials/navbar';
import { PageMenu } from '@/pages/public-profile';
import { ProfileCRMContent } from '.';
import { useAuthContext } from '@/auth';

const ProfileCRMPage = () => {
  const { auth } = useAuthContext(); // 从认证上下文中取 token、role、userId、email 等
  const token = auth?.accessToken;
  
  // 用于存储后端返回的详细用户信息
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!token) return;
    // 调用后端接口获取当前用户详细信息 /auth/user
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/user`,
        { email: auth.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setUserData(response.data);
        setLoadingUser(false);
        console.log('User data:', response.data);
      })
      .catch((err) => {
        console.error('Failed to fetch user data', err);
        setLoadingUser(false);
      });
  }, [token, auth.email]);

  // 根据后端返回的 userData 动态组装 currentUser
  // 如果 userData 存在，就使用它；否则以 auth 中的信息为兜底
  const currentUser = userData
    ? {
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name, // 对于 agency，后端返回 "Oceanview Agency"
        agencyName: userData.agencyInfo?.agency_name || null,
        agencyPhone: userData.agencyInfo?.phone || null,
        agencyAddress: userData.agencyInfo?.address || null,
        agencyLogo: userData.agencyInfo?.logo || null,
        // 其他字段可根据需要添加
      }
    : {
        userId: auth.userId,
        email: auth.email,
        role: auth.role,
        name: auth.role === 'agency' ? 'Agency User' : 'Admin User',
        agencyName: auth.role === 'agency' ? 'Oceanview Agency' : null,
      };

  // 示例头像（可根据用户信息动态调整，比如 agencyLogo）
  const imageUrl = currentUser.role === 'agency' && currentUser.agencyLogo
    ? currentUser.agencyLogo
    : toAbsoluteUrl('/media/avatars/300-1.png');

  const image = (
    <img
      src={imageUrl}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
      alt="User avatar"
    />
  );

  // 在 info 数组中展示用户或机构信息
  // 后续可根据需求解开注释，显示更多字段（如 phone, address）
  const heroInfo = [
    {
      label: 'Email:',
      info: currentUser.email,
      icon: 'sms',
    },
  ];

  if (currentUser.role === 'agency') {
    heroInfo.push({
      label: 'Agency:',
      info: currentUser.agencyName || 'N/A',
      icon: 'people',
    });
    // heroInfo.push({
    //   label: 'Phone:',
    //   info: currentUser.agencyPhone || 'N/A',
    //   icon: 'phone',
    // });
    // heroInfo.push({
    //   label: 'Address:',
    //   info: currentUser.agencyAddress || 'N/A',
    //   icon: 'geolocation',
    // });
  }

  return (
    <Fragment>
      <UserProfileHero
        name={currentUser.name}
        image={image}
        info={heroInfo}
      />

      <Container>
        <Navbar>
          <PageMenu />

          <NavbarActions>
            <button type="button" className="btn btn-sm btn-primary">
              <KeenIcon icon="users" /> Connect
            </button>
            <button className="btn btn-sm btn-icon btn-light">
              <KeenIcon icon="messages" />
            </button>
            <NavbarDropdown />
          </NavbarActions>
        </Navbar>
      </Container>

      <Container>
        <ProfileCRMContent user={currentUser} />
      </Container>
    </Fragment>
  );
};

export { ProfileCRMPage };
