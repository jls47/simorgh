import React from 'react';
import path from 'ramda/src/path';
import VisuallyHiddenText from '@bbc/psammead-visually-hidden-text';
import { textDefaultPropTypes } from '#models/propTypes';
import { headlineModelPropTypes } from '#models/propTypes/headline';

const OffScreenHeadline = props => <VisuallyHiddenText as="h1" {...props} />;

const OffScreenHeadlineContainer = ({ blocks }) => {
  const { text } = path(['0', 'model', 'blocks', '0', 'model'], blocks);

  const id = 'content'; // Used for the skiplink

  return (
    <OffScreenHeadline id={id} tabIndex="-1">
      {text}
    </OffScreenHeadline>
  );
};

OffScreenHeadlineContainer.propTypes = {
  ...headlineModelPropTypes,
};

OffScreenHeadlineContainer.defaultProps = textDefaultPropTypes;

export default OffScreenHeadlineContainer;
