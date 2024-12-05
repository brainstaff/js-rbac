import { RbacError } from "@brainstaff/rbac";
import { AxiosError } from "axios";

export const rethrow = (fn: any) =>
  async function (this: unknown, ...args: unknown[]) {
    try {
      return await fn.call(this, ...args);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data.message) {
        throw new RbacError(err.response.data.message);
      }
      if (err instanceof Error) {
        throw new RbacError(err.message);
      }
      throw new RbacError("Unknown error.");
    }
  };
