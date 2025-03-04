import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Navbar } from '@/partials/navbar';
import { Agencies } from './blocks/Agencies';
export default function AgenciesList () {
  return <Fragment>

      <Container>
        <Agencies />
      </Container>
    </Fragment>;
};
