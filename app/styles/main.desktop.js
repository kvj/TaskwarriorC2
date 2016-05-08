export const styles = {
    "vflex": {
        display: 'flex',
        flexDirection: 'column',
    },
    "hflex": {
        display: 'flex',
        flexDirection: 'row',
    },
    "flex1": {
        flex: '1 1 auto',
    },
    "flex0": {
        flex: '0 0 auto',
    },
    "vproxy": {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
    },
    "hproxy": {
        flex: '1',
        display: 'flex',
        flexDirection: 'row',
    },
    "max": {
        width: '100%',
        height: '100%',
    },

    "none": {
        display: 'none',
    },

    app: {
    },

    center: {
        position: 'relative',
    },

    toolbar: {
        height: 30,
        borderBottom: '1px solid #ddd',
    },

    navigation: {
        width: 200,
        borderRight: '1px solid #ddd',
        backgroundColor: '#eee',
        order: 0,
    },

    navigationFloat: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },

    reports: {
        width: 100,
        borderLeft: '1px solid #ddd',
        backgroundColor: '#eee',
        order: 2,
    },

    reportsFloat: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
    },

    tasks: {
        order: 1,
    },

};

export const _l = (args) => {
    if (Array.isArray(args)) {
        // Join
        let result = {};
        for (var arg of args) {
            if (!arg) {
                continue;
            }
            for (var key in arg) {
                if (arg.hasOwnProperty(key)) {
                    result[key] = arg[key];
                }
            }
        }
        return result;
    }
    return args; // As is
}
