let prefix = '';

export const setEnvPrefix = (_prefix) => {
    prefix = _prefix;
};

export const env = (key, _default = '', group = 'DEFAULT') => {
    const values = [];
    if (prefix) values.push(prefix);
    if (group) values.push(group); // .toUpperCase()
    values.push(key);

    const path: string = values.join('_');

    const value = process.env[path] || _default;
    const [interpolated, envName] = interpolateEnvValue(value);

    if (interpolated) return process.env[envName] || _default;
    return value;
};

export const interpolateEnvValue = (value) => {
    const matches = (value || '').match(/^\$\{(\w+)\}$/);
    if (!matches) return [false, value];

    return [true, matches[1]];
};
