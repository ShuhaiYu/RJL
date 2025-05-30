// ProfileCRMPage.jsx
import { Fragment } from 'react';

import { Container } from '@/components/container';

import { useAuthContext } from '@/auth';
import { ProfileCRMContent } from './ProfileCRMContent';

export default function ProfileCRMPage() {
  const { currentUser } = useAuthContext(); // 从认证上下文中取 token、role、user_id、email 等
  return (
    <Fragment>
      <Container>
        <ProfileCRMContent user={currentUser} />
      </Container>
    </Fragment>
  );
};

