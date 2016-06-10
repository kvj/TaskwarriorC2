import {
    InteractionManager,
} from 'react-native';

export const smooth = (fn, ...args) => {
    return new Promise((rsp, rej) => {
        InteractionManager.runAfterInteractions(async () => {
            try {
                const result = await fn.apply(null, args);
                rsp(result);
            } catch(e) {
                rej(e);
            }
        });
    });
};
