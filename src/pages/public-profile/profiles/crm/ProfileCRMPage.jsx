// ProfileCRMPage.jsx
import { Fragment } from 'react';

import { Container } from '@/components/container';

import { useAuthContext } from '@/auth';
import { ProfileCRMContent } from './ProfileCRMContent';

export default function ProfileCRMPage() {
  const { currentUser } = useAuthContext(); // Get token, role, user_id, email etc. from authentication context
  return (
    <Fragment>
      <Container>
        <ProfileCRMContent user={currentUser} />
      </Container>
    </Fragment>
  );
};

