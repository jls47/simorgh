import React, { useContext } from 'react';
import { node, string, shape } from 'prop-types';
import { ServiceContext } from '#contexts/ServiceContext';
import path from 'ramda/src/path';

import Timestamp from '#components/Promo/timestamp';
import LiveLabel from '#legacy/psammead-live-label/src';
import useViewTracker from '#hooks/useViewTracker';

import Title from './Title';
import Link from './Link';
import MediaIndicator from './MediaIndicator';
import Content from './Content';
import { PromoWrapper, ContentWrapper, BorderWrapper } from './Wrappers.styles';
import Image from './Image';

const PromoContext = React.createContext({});

const Promo = ({
  children,
  to,
  ariaLabelledBy,
  mediaType,
  eventTrackingData,
}) => {
  const { service } = useContext(ServiceContext);

  const eventTrackingDataSend = path(['block'], eventTrackingData);

  const viewRef = useViewTracker(eventTrackingDataSend);

  return (
    <BorderWrapper>
      <PromoWrapper ref={viewRef}>
        <PromoContext.Provider
          value={{ service, to, ariaLabelledBy, eventTrackingData, mediaType }}
        >
          {children}
        </PromoContext.Provider>
      </PromoWrapper>
    </BorderWrapper>
  );
};

const withPromoContext = Component => props =>
  (
    <PromoContext.Consumer>
      {context => <Component {...context} {...props} />}
    </PromoContext.Consumer>
  );

Promo.ContentWrapper = withPromoContext(ContentWrapper);
Promo.Title = withPromoContext(Title);
Promo.MediaIndicator = withPromoContext(MediaIndicator);
Promo.Link = withPromoContext(Link);
Promo.Content = withPromoContext(Content);

// Outside NewStoryPromo
Promo.Timestamp = withPromoContext(Timestamp);
Promo.LiveLabel = withPromoContext(LiveLabel);
Promo.Image = withPromoContext(Image);

Promo.propTypes = {
  children: node.isRequired,
  to: string,
  ariaLabelledBy: string.isRequired,
  mediaType: string,
  eventTrackingData: shape({ block: shape({ componentName: string }) }),
};

Promo.defaultProps = { to: '', mediaType: '', eventTrackingData: null };

export default Promo;
