export type TypeOfClassMethod<T, M extends keyof T> = T[M] extends Function ? T[M] : never;
