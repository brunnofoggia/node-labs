export const stringToJSON = ({ input, pairSeparator = ';', keyValueSeparator = '=', keys = [] }) => {
    const json: any = {};
    const pairs = input.split(pairSeparator);

    pairs.forEach((pair, index) => {
        const divisorIndex = pair.indexOf(keyValueSeparator);
        let key, value;

        if (divisorIndex > 0) {
            key = pair.substring(0, divisorIndex);
            value = pair.substring(divisorIndex + 1);
        } else {
            key = keys[index];
            value = pair;
            if (key === undefined)
                throw new Error('stringToJSON: Key not found for index ' + index + ' in keys array or string format not properly set.');
        }

        json[key] = value;
    });

    return json;
};
