/**
 * This modules shows the usage of custom logger
 */
// @ts-check

/**
 * @satisfies {import("reciple").RecipleModuleData}
 */
export default {
    versions: '^8',
    /**
     * @type {import("reciple").Logger|undefined}
     */
    logger: undefined,
    /**
     * @param {import("reciple").RecipleModuleStartData} param0 
     */
    onStart({ client }) {
        this.logger = client.logger.clone({ name: 'My Logger' });
        return true;
    },
    /**
     * @param {import("reciple").RecipleModuleLoadData} param0 
     */
    onLoad({ client }) {
        this.logger.log(`A log message`);           // Logger#info is synonymous to Logger#log
        this.logger.warning(`A warning message`);   // Logger#warn is synonymous to Logger#warning
        this.logger.error(`An error message`);      // Logger#err is synonymous to Logger#error
        this.logger.debug(`A debug message`);       // Debug messages are shown when debug mode is enabled
    }
};
