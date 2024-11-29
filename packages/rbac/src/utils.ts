type Nullish<T> = {
    [P in keyof T]+?: T[P] | null | undefined;
};

export type NullishBy<T, K extends keyof T> = Omit<T, K> & Nullish<Pick<T, K>>;
