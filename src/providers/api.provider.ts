import _debug from 'debug';
const debug = _debug('api:ApiProvider');

import axios from 'axios';
import { defaultsDeep } from 'lodash';
import { HttpStatusCode } from 'axios';

import { throwHttpException } from '../utils/errors';
import { sleep } from '../utils';

export class ApiProvider {
    static _sleep = 1000;
    static baseUrl = '';

    static async request(options, _retry = 3) {
        if (!this.baseUrl) throwHttpException('api base url not found', HttpStatusCode.BadGateway);
        const url = /^http/.test(options.url) ? options.url : [this.baseUrl, options.url].join('/');
        debug(url, options);

        try {
            return await this._request({
                ...options,
                url,
            });
        } catch (error) {
            if (this.retryCheck(error, _retry)) {
                return await this.retryRequest(options, error, _retry);
            }

            const data = typeof error.response?.data === 'object' ? error.response?.data : {};
            const dataStr: any = typeof data === 'object' ? JSON.stringify(data) : error.response?.data || '';
            debug([error.code, error.message || '', dataStr, url].join(';\n'));
            throwHttpException(error, HttpStatusCode.BadGateway);
        }
    }

    /* alias */
    static async fetch(options, _retry = 3) {
        return this.request(options, _retry);
    }

    static retryCheck(error, _retry) {
        return error.code === 'ECONNREFUSED' && _retry > 0;
    }

    static async retryRequest(options, error, _retry) {
        debug('retrying request', options.url);
        await sleep(this._sleep);
        return await this.request(options, _retry - 1);
    }

    static async _request(_options) {
        const options = defaultsDeep(_options, {
            method: _options.data ? 'post' : 'get',
            headers: this.defaultHeaders(),
        });

        debug('pure request', options);
        return await axios(options);
    }

    static defaultHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }
}
