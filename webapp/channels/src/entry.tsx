// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';

import {logError, LogErrorBarMode} from 'mattermost-redux/actions/errors';

import store from 'stores/redux_store';

import App from 'components/app';

import {getCurrentLocale} from 'selectors/i18n';

import {AnnouncementBarTypes} from 'utils/constants';
import {setCSRFFromCookie} from 'utils/utils';

// Import our styles
import 'katex/dist/katex.min.css';

import '@mattermost/compass-icons/css/compass-icons.css';
import '@mattermost/components/dist/index.esm.css';

declare global {
    interface Window {
        publicPath?: string;
    }
}

// This is for anything that needs to be done for ALL react components.
// This runs before we start to render anything.
function preRenderSetup(onPreRenderSetupReady: () => void) {
    window.onerror = (msg, url, line, column, error) => {
        if (msg === 'ResizeObserver loop limit exceeded') {
            return;
        }

        store.dispatch(
            logError(
                {
                    type: AnnouncementBarTypes.DEVELOPER,
                    message: 'A JavaScript error in the webapp client has occurred. (msg: ' + msg + ', row: ' + line + ', col: ' + column + ').',
                    stack: error?.stack,
                    url,
                },
                {errorBarMode: LogErrorBarMode.InDevMode},
            ),
        );
    };

    setCSRFFromCookie();

    onPreRenderSetupReady();
}

function applyLocaleDirection(locale: string) {
    document.documentElement.setAttribute('dir', locale === 'fa' ? 'rtl' : 'ltr');
}

function applyLocaleFont(locale: string) {
    document.body.classList.toggle('font--iran_sans', locale === 'fa');
    document.body.classList.toggle('font--open_sans', locale !== 'fa');
}

async function loadLocaleStyles() {
    const locale = getCurrentLocale(store.getState());
    applyLocaleDirection(locale);
    applyLocaleFont(locale);

    if (locale === 'fa') {
        await import('./sass-rtl/styles.scss');
        return;
    }

    await import('./sass/styles.scss');
}


function renderReactRootComponent() {
    // We're using React 18, but we're using the deprecated way of starting React because ReactDOM.createRoot enables
    // new features such as automatic batching which breaks some components. This will need to be changed in the future
    // because this method of starting the app will be removed in React 19.
    ReactDOM.render(<App/>, document.getElementById('root')!);
}

/**
 * Adds a function to be invoked when the DOM content is loaded.
 */
function appendOnDOMContentLoadedEvent(onDomContentReady: () => void) {
    if (document.readyState === 'loading') {
        // If the DOM hasn't finished loading, add an event listener and call the function when it does
        document.addEventListener('DOMContentLoaded', onDomContentReady);
    } else {
        // If the DOM is already loaded, call the function immediately
        onDomContentReady();
    }
}

appendOnDOMContentLoadedEvent(() => {
    // Do the pre-render setup and call renderReactRootComponent when done
    preRenderSetup(async () => {
        await loadLocaleStyles();

        let previousLocale = getCurrentLocale(store.getState());
        store.subscribe(() => {
            const locale = getCurrentLocale(store.getState());
            if (locale !== previousLocale) {
                previousLocale = locale;
                applyLocaleDirection(locale);
                applyLocaleFont(locale);
            }
        });

        renderReactRootComponent();
    });

});
