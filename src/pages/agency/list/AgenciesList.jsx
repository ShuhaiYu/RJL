import { Fragment } from 'react';
import { Container } from '@/components/container';
import { toAbsoluteUrl } from '@/utils/Assets';
import { KeenIcon } from '@/components';
import { Navbar, NavbarActions, NavbarDropdown } from '@/partials/navbar';
import { Agencies } from './blocks';
const AgenciesList = () => {
  return <Fragment>
      <Container>
        <Navbar>
        </Navbar>
      </Container>

      <Container>
        <Agencies />
      </Container>
    </Fragment>;
};
export { AgenciesList };
