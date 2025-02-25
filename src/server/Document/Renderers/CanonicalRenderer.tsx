/* eslint-disable react/no-danger */
import React from 'react';
import IfAboveIE9 from '#app/legacy/components/IfAboveIE9Comment';
import NO_JS_CLASSNAME from '#app/lib/noJs.const';
import {
  getEnvConfig,
  getProcessEnvAppVariables,
} from '#app/lib/utilities/getEnvConfig';
import serialiseForScript from '#app/lib/utilities/serialiseForScript';
import { BaseRendererProps } from './types';

interface Props extends BaseRendererProps {
  data: Record<string, unknown>;
  isApp: boolean;
  links: React.ReactElement;
  legacyScripts: React.ReactElement;
  modernScripts: React.ReactElement;
}

export default function CanonicalRenderer({
  data,
  helmetMetaTags,
  helmetLinkTags,
  helmetScriptTags,
  htmlAttrs,
  html,
  isApp,
  ids,
  links,
  legacyScripts,
  modernScripts,
  styles,
  title,
}: Props) {
  const serialisedData = serialiseForScript(data);
  const appEnvVariables = serialiseForScript(getProcessEnvAppVariables());

  return (
    <html lang="en-GB" className={NO_JS_CLASSNAME} {...htmlAttrs}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.__reverb = {};
            window.__reverb.__reverbLoadedPromise = new Promise((resolve, reject) => {
              window.__reverb.__resolveReverbLoaded = resolve;
              window.__reverb.__rejectReverbLoaded = reject;
            });

            window.__reverb.__reverbTimeout = setTimeout(() => {
              window.__reverb.__rejectReverbLoaded();
            }, 5000);`,
          }}
        />
        <script async src={`${getEnvConfig().SIMORGH_REVERB_SOURCE}`} />

        {isApp && <meta name="robots" content="noindex" />}
        {title}
        {helmetMetaTags}
        {helmetLinkTags}
        {helmetScriptTags}
        <style
          data-emotion-css={ids?.join(' ')}
          dangerouslySetInnerHTML={{ __html: styles }}
        />
        <script
          dangerouslySetInnerHTML={{
            // Read env variables from the server and expose them to the client
            __html: `window.SIMORGH_ENV_VARS=${appEnvVariables}`,
          }}
        />
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: html || '' }} />
        <script
          // This script should be the first script tag in the body, otherwise Opera Mini has trouble parsing the `window.SIMORGH_DATA` object
          dangerouslySetInnerHTML={{
            __html: `window.SIMORGH_DATA=${serialisedData}`,
          }}
        />
        {links}
        <IfAboveIE9>
          {modernScripts}
          {legacyScripts}
        </IfAboveIE9>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove("no-js");`,
          }}
        />
      </body>
    </html>
  );
}
