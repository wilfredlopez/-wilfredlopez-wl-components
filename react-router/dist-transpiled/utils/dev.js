export const isDevMode = () => {
    return process && process.env && process.env.NODE_ENV === 'development';
};
export const deprecationWarning = (message) => {
    if (isDevMode()) {
        console.warn(message);
    }
};
//# sourceMappingURL=dev.js.map