
export const docs: any = {};

docs.example = {
    summary: "",
    description: '',
    value: {}
};

docs.createStructure = (_docs, methods) => methods.forEach(method => {
    _docs[method] = {
        description: '',
        type: {},
        examples: {
            a: {
                ...docs.example,
            }
        },
        responses: []
    };
});

