import { AxiosError } from "axios";

import { RbacError } from "@brainstaff/rbac";

export const rethrow = (target: Function) => async function (this: unknown, ...args: unknown[]) {
  try {
    return await target.call(this, ...args);
  } catch (err) {
    if (err instanceof AxiosError && err.response?.data.message) {
      throw new RbacError(err.response.data.message);
    }
    if (err instanceof Error) {
      throw new RbacError(err.message);
    }
    throw new RbacError("Unknown error.");
  }
}
