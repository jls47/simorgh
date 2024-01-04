// eslint-disable no-console
const { exec } = require('child_process');
const fs = require('fs');
const { dependencies, devDependencies } = require('../package.json');

const allDependencies = { ...dependencies, ...devDependencies };
const depenencyTable = [];
const datediff = (first, second) =>
  Math.round((second - first) / (1000 * 60 * 60 * 24));
const dateNow = new Date().getTime();
const target = Object.keys(allDependencies).length;
const downloadsBaseUrl = 'https://api.npmjs.org/downloads/point/last-week/';

const fetchResponse = async link => {
  const fetchStatus = await fetch(link, { timeout: 20000 });
  return fetchStatus;
};

// A lot of this function feels clunky. I'm sure there's a better way of doing this.
const dealWithCaretsAndTildes = (versionString, timeJson) => {
  const plainVersion = versionString.match(/^[\d\.]+$/g);
  if (plainVersion) {
    return versionString; // if it's just numbers and dots
  }
  const lowestVersionMatches = versionString.match(/[\d\.]+$/g);
  if (!lowestVersionMatches) {
    return 'Unkonwn'; // if it contains a string that doesn't end in numbers and dots we give up
  }
  const splitOurVersionArray = lowestVersionMatches[0].split('.');

  let versionMatcherString = '';
  if (versionString.indexOf('^') !== -1) {
    versionMatcherString = splitOurVersionArray[0]; // caret means we are going to get anything belonging to major
  }
  if (versionString.indexOf('~') !== -1) {
    splitOurVersionArray.pop(); // tilde means we get all patches of the minor
    versionMatcherString = splitOurVersionArray.join('\\.');
  }
  versionMatcherString += '\\.';

  let versionToReturn = '';
  // loop through response from npm (which is handily in series order) and match our version with regex
  Object.keys(timeJson).forEach(version => {
    const splitVersionArray = version.split('.');
    const ourRegex = new RegExp(`^${versionMatcherString}`, 'gi');
    if (version.match(ourRegex)) {
      versionToReturn = version;
    }
  });
  return versionToReturn;
};

const collectResults = async ({ dep, modifiedDate, ourFreshness }) => {
  console.log(`Checking ${dep} for download count`);
  await fetchResponse(downloadsBaseUrl + dep).then(response => {
    console.log(`Received download count data for ${dep}`);
    const responseJson = response.json().then(json => {
      depenencyTable.push({
        name: dep,
        freshness: datediff(modifiedDate.getTime(), dateNow),
        ourfreshness: ourFreshness,
        weeklyDownloads: json.downloads,
      });
      if (depenencyTable.length === target) {
        let csvContents =
          'dependency,Days since last activity,Freshness of our version in days,Downloads Last Week';
        depenencyTable.forEach(
          ({ name, freshness, ourfreshness, weeklyDownloads }) => {
            csvContents += `\n${name},${freshness},${ourfreshness},${weeklyDownloads}`;
          },
        );
        fs.writeFileSync('./depenencyFreshnessTable.csv', csvContents);
      }
    });
  });
};

Object.keys(allDependencies).forEach((dep, i) => {
  console.log(`Checking ${dep} for last modified date`);
  const cmd = exec(`npm view ${dep} time --json`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
    }
    const stdoutJson = JSON.parse(stdout);
    const modifiedDate = new Date(stdoutJson.modified);
    const ourVersion = dealWithCaretsAndTildes(
      allDependencies[dep],
      stdoutJson,
    );
    const dateOfOurVersion = new Date(stdoutJson[ourVersion]);
    const ourFreshness = datediff(dateOfOurVersion.getTime(), dateNow);
    collectResults({
      dep,
      modifiedDate,
      ourFreshness,
    });
  });
});
