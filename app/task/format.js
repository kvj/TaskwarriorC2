export const parseDate = (s) => {
    if (!s || s.length != 16) {
        return undefined;
    }
    const msec = Date.UTC(s.substr(0, 4), parseInt(s.substr(4, 2))-1, s.substr(6, 2), s.substr(9, 2), s.substr(11, 2), s.substr(13, 2));
    return new Date(msec);
}

export const formatters = {
    description(obj, format) {
        const ann = obj.annotations || [];
        const desc = obj.description || '';
        if (format == 'desc' || format == 'truncated') {
            return desc;
        }
        if (format == 'count' || format == 'truncated_count') {
            if (ann.length) {
                obj.description_count = `[${ann.length}]`;
            }
            return desc;
        }

    },
};
