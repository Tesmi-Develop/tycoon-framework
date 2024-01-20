export const consolePrefix = `TycoonFramework`;
const errorString = `--// [${consolePrefix}]: Caught an error in your code //--`;

export function logError(Message: string, DisplayTraceback = true): never {
	return error(`\n ${errorString} \n ${Message} \n \n ${DisplayTraceback ?? debug.traceback()}`);
}

export function logAssert<T>(condition: T, message: string): asserts condition {
	// eslint-disable-next-line roblox-ts/lua-truthiness
	!condition && logError(message);
}
