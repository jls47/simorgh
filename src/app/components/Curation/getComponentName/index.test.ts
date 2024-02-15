import {
  VISUAL_STYLE,
  VISUAL_PROMINENCE,
} from '#app/models/types/curationData';
import getComponentName, { COMPONENT_NAMES } from '.';
import afriqueHomePage from '../../../../../data/afrique/homePage/index.json';

const { MINIMUM, LOW, NORMAL, HIGH, MAXIMUM } = VISUAL_PROMINENCE;
const { NONE, BANNER, COLLECTION, RANKED } = VISUAL_STYLE;
const {
  MOST_READ,
  MESSAGE_BANNER,
  SIMPLE_CURATION_GRID,
  HIERARCHICAL_CURATION_GRID,
  NOT_SUPPORTED,
  RADIO_SCHEDULE,
} = COMPONENT_NAMES;

describe('getComponentName', () => {
  it.each`
    visualStyle     | visualProminence     | expected
    ${BANNER}       | ${MINIMUM}           | ${NOT_SUPPORTED}
    ${BANNER}       | ${LOW}               | ${NOT_SUPPORTED}
    ${BANNER}       | ${NORMAL}            | ${MESSAGE_BANNER}
    ${BANNER}       | ${HIGH}              | ${NOT_SUPPORTED}
    ${BANNER}       | ${MAXIMUM}           | ${NOT_SUPPORTED}
    ${NONE}         | ${NORMAL}            | ${SIMPLE_CURATION_GRID}
    ${NONE}         | ${HIGH}              | ${HIERARCHICAL_CURATION_GRID}
    ${COLLECTION}   | ${HIGH}              | ${HIERARCHICAL_CURATION_GRID}
    ${RANKED}       | ${NORMAL}            | ${MOST_READ}
    ${'fake-style'} | ${'fake-prominence'} | ${null}
  `(
    'should return $expected when visual style is $visualStyle and visual prominence is $visualProminence and curation type is $curationType',
    ({ visualStyle, visualProminence, expected }) => {
      expect(
        getComponentName({
          visualStyle,
          visualProminence,
          radioSchedule: undefined,
        }),
      ).toBe(expected);
    },
  );
  it('should return radio schedule when curationType is radio-schedule and visual style is NONE and visualProminence is NORMAL', () => {
    const visualProminence = NORMAL;
    const visualStyle = NONE;
    const { radioSchedule } = afriqueHomePage.data.curations[5];

    expect(
      getComponentName({ visualStyle, visualProminence, radioSchedule }),
    ).toBe(`${RADIO_SCHEDULE}`);
  });
});
