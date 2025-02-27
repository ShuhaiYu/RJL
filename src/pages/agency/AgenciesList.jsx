import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Navbar } from '@/partials/navbar';
import { Agencies } from './blocks/Agencies';
export default function AgenciesList () {
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
