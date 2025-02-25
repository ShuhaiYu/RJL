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
  const { currentUser } = useAuthContext(); // 从认证上下文中取 token、role、user_id、email 等

  console.log('currentUser:', currentUser);
  
  

  return (
    <Fragment>
      {/* <UserProfileHero
        name={currentUser.name}
        image={image}
        info={heroInfo}
      /> */}

      {/* <Container>
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
      </Container> */}

      <Container>
        <ProfileCRMContent user={currentUser} />
      </Container>
    </Fragment>
  );
};

export { ProfileCRMPage };
