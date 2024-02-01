import _ from 'lodash';

export const router: any = (path, modules) => _.map(modules, module => ({
    path: '/' + path,
    module,
}));
