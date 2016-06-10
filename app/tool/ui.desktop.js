export const smooth = (fn, ...args) => {
    return new Promise((rsp, rej) => {
        setTimeout(async () => {
            try {
                const result = await fn.apply(null, args);
                rsp(result);
            } catch(e) {
                rej(e);
            }
        }, 1);
    });
};
