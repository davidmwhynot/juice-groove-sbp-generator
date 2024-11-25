export const defined = <T = unknown>(t: T): t is Exclude<T, undefined | null> =>
	t !== undefined && t !== null;
