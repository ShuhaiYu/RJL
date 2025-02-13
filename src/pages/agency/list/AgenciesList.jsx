import { Fragment } from 'react';
import { Container } from '@/components/container';
import { toAbsoluteUrl } from '@/utils/Assets';
import { KeenIcon } from '@/components';
import { Navbar, NavbarActions, NavbarDropdown } from '@/partials/navbar';
import { Agencies } from './blocks';
const AgenciesList = () => {
  return <Fragment>
    {/*  <UserProfileHero name="Jenny Klabber" image={image} info={[{*/}
    {/*  label: 'KeenThemes',*/}
    {/*  icon: 'abstract'*/}
    {/*}, {*/}
    {/*  label: 'SF, Bay Area',*/}
    {/*  icon: 'geolocation'*/}
    {/*}, {*/}
    {/*  email: 'jenny@kteam.com',*/}
    {/*  icon: 'sms'*/}
    {/*}]} />*/}

      <Container>
        <Navbar>
          {/* <PageMenu /> */}

          {/*<NavbarActions>*/}
          {/*  <button type="button" className="btn btn-sm btn-primary">*/}
          {/*    <KeenIcon icon="users" /> Connect*/}
          {/*  </button>*/}
          {/*  <button className="btn btn-sm btn-icon btn-light">*/}
          {/*    <KeenIcon icon="messages" />*/}
          {/*  </button>*/}
          {/*  <NavbarDropdown />*/}
          {/*</NavbarActions>*/}
        </Navbar>
      </Container>

      <Container>
        <Agencies />
      </Container>
    </Fragment>;
};
export { AgenciesList };
