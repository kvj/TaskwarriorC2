const fontFamily = 'Monaco Regular, Monospace';

export const styles = {
    "vflex": {
        display: 'flex',
        flexDirection: 'column',
    },
    "hflex": {
        display: 'flex',
        flexDirection: 'row',
    },
    "wflex": {
        flexWrap: 'wrap',
    },
    "flex1": {
        flex: '1 1 auto',
    },
    "flex1s": {
        flex: '1 1 0',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    "flex0": {
        flex: '0 0 auto',
    },
    "spacer": {
        flex: '1 1 0',
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
    "hbar": {
        alignItems: "center",
    },
    "eflex": {
        justifyContent: "flex-end",
    },
    "max": {
        width: '100%',
        height: '100%',
    },

    "none": {
        display: 'none',
    },

    "btn": {
        border: 0,
        borderRadius: 0,
        margin: 3,
        padding: 5,
        textAlign: "center",
        fontSize: "1em",
        backgroundColor: "#ddd",
        color: "#333",
        outline: "none",
    },

    "inp": {
        border: 0,
        borderRadius: 0,
        margin: 3,
        padding: 5,
        fontSize: "1em",
        verticalAlign: "middle",
        backgroundColor: "#eee",
        color: "#555",
        fontFamily: fontFamily,
        minWidth: 150,
        borderLeft: "4px solid #ddd",
    },
    "oneLine": {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: 'hidden',
    },

    "textSmall": {
        fontSize: "0.8em",
    },

    "textRight": {
        textAlign: "right",
    },

    "floatBR": {
        position: "absolute",
        right: 5,
        bottom: 20,
        width: 350,
    },

    app: {
    },

    center: {
        position: 'relative',
    },

    toolbar: {
        borderBottom: '1px solid #ddd',
    },

    statusbar: {
        borderTop: '1px solid #ddd',
        padding: 3,
        justifyContent: 'space-between',
    },

    navigation: {
        width: 150,
        borderRight: '1px solid #ddd',
        backgroundColor: '#fff',
        order: 0,
    },

    navigationFloat: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },

    reports: {
        width: 150,
        borderLeft: '1px solid #ddd',
        backgroundColor: '#fff',
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

    text: {
        fontSize: "1em",
        verticalAlign: "middle",
        fontFamily: fontFamily,
        padding: 2,
        border: "2px solid transparent",
        whiteSpace: 'pre-wrap',
    },

    one_task: {
        backgroundColor: "#fafafa",
        marginBottom: 5,
        width: "100%",
    },

    one_report: {
        backgroundColor: "#fafafa",
        marginBottom: 5,
    },

    description: {
        alignSelf: 'center',
    },

    floatBlock: {
        backgroundColor: "#fff",
        padding: 5,
        marginBottom: 10,
        cursor: "pointer",
        border: "2px solid #f0f0f0",
    }

};

export const _l = (...args) => {
    let arr = args;
    if (arr.length == 1 && Array.isArray(arr[0])) { // Convert
        arr = arr[0];
    };
    if (arr.length == 1) { // One item
        return arr[0];
    };
    // Join
    let result = {};
    for (var arg of arr) {
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
