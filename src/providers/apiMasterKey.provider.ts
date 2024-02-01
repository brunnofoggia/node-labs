import { defaultsDeep } from 'lodash';
import { ApiProvider } from './api.provider';

export class ApiMasterKeyProvider extends ApiProvider {
    static authPath = '';
    static authMethod = 'post';
    static authHeaderPrefix = 'Token';
    protected static masterKey = '';

    static isAuthenticated() {
        return !!this.masterKey;
    }

    protected static authHeaders() {
        const masterKeyEncoded = Buffer.from(this.masterKey, 'utf8').toString('base64');
        return {
            'Authorization': [this.authHeaderPrefix, masterKeyEncoded].join(' '),
        };
    }

    static defaultHeaders() {
        let defaultHeaders: any = super.defaultHeaders();
        if (this.isAuthenticated()) {
            defaultHeaders = defaultsDeep(defaultHeaders, this.authHeaders());
        }

        return defaultHeaders;
    }
}
