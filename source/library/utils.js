import { browser, Windows } from 'webextension-polyfill-ts';
export const search = (keyword) => {
    if (navigator.userAgent.includes('Chrome')) {
        browser.search.query({
            disposition: 'NEW_TAB',
            text: keyword
        });
    } else {
        browser.search.search({
            query: keyword
        });
    }
};


export const translate = {
    scanResult: {
        cn: '扫描结果',
        en: 'Scanning Result'
    },
    retry: {
        cn: '重试',
        en: 'Retry'
    },
    copy: {
        cn: '复制',
        en: 'Copy'
    },
    openUrl: {
        cn: '打开网址',
        en: 'Open URL'
    },
    searchText: {
        cn: '搜索文本',
        en: 'Search Text'
    }
};

export const t = (key) => {
    var language;
    if (navigator.language.includes('zh')) {
        language = 'cn';
    } else {
        language = 'en';
    }
    return translate[key][language];
};


export const openWebPage = (url) => {
    return browser.windows.create({
        url,
        width: 750,
        height: 750,
        incognito: false,
        type: 'panel'
    });
}


export const getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); return null;
}