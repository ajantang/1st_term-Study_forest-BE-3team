import * as s from "superstruct";

export const Password = s.object({
  password: s.size(s.string(), 8, 24),
});
