/**
 * This modules shows the usage of custom logger
 */
// @ts-check

/**
 * @satisfies {import("reciple").RecipleModuleData}
 */
export class CustomLogger {
    /**
     * @type {import("reciple").Logger|undefined}
     */
    logger;

    /**
     * @param {import("reciple").RecipleModuleStartData} param0 
     */
    onStart({ client }) {
        this.logger = logger?.clone({ label: 'My Logger' });
        return true;
    }

    /**
     * @param {import("reciple").RecipleModuleLoadData} param0 
     */
    onLoad({ client }) {
        this.logger?.log(`A log message`);           // Logger#info is synonymous to Logger#log
        this.logger?.warn(`A warning message`);   // Logger#warn is synonymous to Logger#warning
        this.logger?.error(`An error message`);      // Logger#err is synonymous to Logger#error
        this.logger?.debug(`A debug message`);       // Debug messages are shown when debug mode is enabled
    }
};

export default new CustomLogger();
