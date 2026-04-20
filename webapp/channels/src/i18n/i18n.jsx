// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @typedef {} Language
 */

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {langFiles, langIDs, langLabels} from './imports';

// should match the values in server/public/shared/i18n/i18n.go
export const languages = {
    en: {
        value: 'en',
        name: 'English (US)',
        order: 0,
        url: '',
    },
    fa: {
        value: 'fa',
        name: 'فارسی (Alpha)',
        order: 1,
        url: langFiles.fa,
    },
};

export function getAllLanguages(includeExperimental) {
    if (includeExperimental) {
        let order = Object.keys(languages).length;
        return {
            ...langIDs.reduce((out, id) => {
                out[id] = {
                    value: id,
                    name: langLabels[id] + ' (Experimental)',
                    url: langFiles[id],
                    order: order++,
                };
                return out;
            }, {}),
            ...languages,
        };
    }
    return languages;
}

/**
 * @param {import('types/store').GlobalState} state
 * @returns {Record<string, Language>}
 */
export function getLanguages(state) {
    const config = getConfig(state);
    if (!config.AvailableLocales) {
        return getAllLanguages(config.EnableExperimentalLocales === 'true');
    }
    return config.AvailableLocales.split(',').reduce((result, l) => {
        if (languages[l]) {
            result[l] = languages[l];
        }
        return result;
    }, {});
}

export function getLanguageInfo(locale) {
    return getAllLanguages(true)[locale];
}

/**
 * @param {import('types/store').GlobalState} state
 * @param {string} locale
 * @returns {boolean}
 */
export function isLanguageAvailable(state, locale) {
    return Boolean(getLanguages(state)[locale]);
}
