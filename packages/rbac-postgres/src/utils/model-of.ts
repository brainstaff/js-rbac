type PickRequired<T> = {
  [P in keyof T as undefined extends T[P] ? never : P]: T[P];
};

type PickOptional<T> = {
  [P in keyof T as undefined extends T[P] ? P : never]: T[P];
};

type OptionalAsRequiredOrNull<T> = {
  [K in keyof PickRequired<T>]: T[K];
} & {
  [K in keyof PickOptional<T>]-?: T[K] | null;
};

export type ModelOf<T extends object> = OptionalAsRequiredOrNull<T>;
