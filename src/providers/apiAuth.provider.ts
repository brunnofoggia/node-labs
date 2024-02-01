import _debug from 'debug';
const debug = _debug('api:apiAuthProvider');

import { defaultsDeep } from 'lodash';
import { HttpStatusCode } from 'axios';

import { ApiProvider } from './api.provider';
import { sleep } from '../utils';

export abstract class ApiAuthProvider extends ApiProvider {
    static authPath = '';
    static authMethod = 'post';

    static authenticationResponseToken(data) {
        return '';
    }

    protected static token = '';

    static isAuthenticated() {
        return !!this.token;
    }

    static isAuthorizing(options) {
        return options.url.indexOf(this.authPath) > this.baseUrl.length;
    }

    static async _request(options) {
        if (!this.isAuthenticated() && !this.isAuthorizing(options)) {
            await this.authentication();
        }
        return await super._request(options);
    }

    static async authentication() {
        debug('authenticating');
        const options = {
            url: this.authPath,
            method: this.authMethod || 'post',
            data: this.authenticationBody(),
            headers: this.authenticationHeaders(),
        };
        debug(options);
        const response = await this.request(options);
        const data = response.data;
        this.token = this.authenticationResponseToken(data);
    }

    protected static authenticationBody() {
        return {};
    }

    protected static authenticationHeaders() {
        return {};
    }

    protected static loggedHeaders() {
        return {
            Authorization: 'Bearer ' + this.token,
        };
    }

    static defaultHeaders() {
        let defaultHeaders: any = super.defaultHeaders();
        if (this.isAuthenticated()) {
            defaultHeaders = defaultsDeep(this.loggedHeaders(), defaultHeaders);
        }

        return defaultHeaders;
    }

    static retryCheck(error, _retry) {
        return (_retry > 0 && error.code === 'ECONNREFUSED') || error?.response?.status === HttpStatusCode.Unauthorized;
    }

    static async retryRequest(options, error, _retry) {
        await sleep(this._sleep);
        if (error?.response?.status === HttpStatusCode.Unauthorized) {
            await this.authentication();
        }
        return await this.request(options, _retry - 1);
    }
}
