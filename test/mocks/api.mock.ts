import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const request = {
    url: 'https://localhost:3001'
};

export const response: AxiosResponse = {
    status: 200,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig<any>,
    data: { some: 'data' }
};

export const reject = { code: 'ECONNREFUSED' };
