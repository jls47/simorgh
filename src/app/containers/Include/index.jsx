import React, { useContext } from 'react';
import { string } from 'prop-types';

import EmbedError from '@bbc/psammead-embed-error';
import nodeLogger from '#lib/logger.node';
import { INCLUDE_RENDERED } from '#lib/logger.const';
import { RequestContext } from '#contexts/RequestContext';
import useToggle from '#hooks/useToggle';

import Canonical from './canonical';
import Idt2Canonical from './canonical/Idt2';
import Idt2Amp from './amp/Idt2Amp';
import VjAmp from './amp/VjAmp';

const logger = nodeLogger(__filename);

const componentsToRender = {
  amp: {
    idt2: props => <Idt2Amp {...props} />,
    vj: props => <VjAmp {...props} />,
  },
  canonical: {
    idt1: props => <Canonical {...props} />,
    idt2: props => <Idt2Canonical {...props} />,
    vj: props => <Canonical {...props} />,
  },
};

const IncludeContainer = props => {
  const { isAmp } = useContext(RequestContext);
  const { enabled } = useToggle('include');

  if (!enabled) return null;
  const { showEmbedError, href, type } = props;

  if (showEmbedError) {
    return (
      <EmbedError
        message="Sorry, we can’t display this part of the story on this lightweight mobile page."
        link={{
          text: 'View the full version of the page to see all the content.',
          href: 'https://www.bbc.co.uk/',
        }}
        fillViewport
      />
    );
  }

  logger.info(INCLUDE_RENDERED, {
    includeUrl: href,
    type,
  });

  const platform = isAmp ? 'amp' : 'canonical';

  return componentsToRender[platform][type]
    ? componentsToRender[platform][type](props)
    : null;
};

IncludeContainer.propTypes = {
  href: string.isRequired,
  type: string.isRequired,
};

export default IncludeContainer;
