import * as React from 'react';
import { render } from 'react-dom';
import { ViewPanel } from './ViewPanel';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { SENTRY_LINK, SentryIgnore } from '../constants';
import { RecoilRoot } from 'recoil';

import './styles.css';

// require('@vscode/codicons/dist/codicon.css');
import '@bendera/vscode-webview-elements/dist/vscode-table.js';
import '@bendera/vscode-webview-elements/dist/vscode-table-header.js';
import '@bendera/vscode-webview-elements/dist/vscode-table-header-cell.js';
import '@bendera/vscode-webview-elements/dist/vscode-table-body.js';
import '@bendera/vscode-webview-elements/dist/vscode-table-row.js';
import '@bendera/vscode-webview-elements/dist/vscode-table-cell.js';
import '@bendera/vscode-webview-elements/dist/vscode-collapsible.js';
import '@bendera/vscode-webview-elements/dist/vscode-label.js';
import { I10nProvider } from '../dashboardWebView/providers/I10nProvider';
// import '@bendera/vscode-webview-elements/dist/vscode-checkbox.js';

// import '@vscode/webview-ui-toolkit/dist/esm/checkbox';

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const elm = document.querySelector('#app');

if (elm) {
  const version = elm?.getAttribute('data-version');
  const environment = elm?.getAttribute('data-environment');
  const isProd = elm?.getAttribute('data-isProd');

  if (isProd === 'true') {
    Sentry.init({
      dsn: SENTRY_LINK,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0, // No performance tracing required
      release: version || '',
      environment: environment || '',
      ignoreErrors: SentryIgnore
    });

    Sentry.setTag("type", "panel");
    if (document.body.getAttribute(`data-vscode-theme-id`)) {
      Sentry.setTag("theme", document.body.getAttribute(`data-vscode-theme-id`));
    }
  }

  render(
    <I10nProvider>
      <RecoilRoot>
        <ViewPanel />
      </RecoilRoot>
    </I10nProvider>,
    elm
  );
}

// Webpack HMR
if ((module as any).hot) (module as any).hot.accept();
