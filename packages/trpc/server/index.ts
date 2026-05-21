import { router } from "./trpc";

import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/forms/route";

export const serverRouter = router({
  auth: authRouter,
  forms: formsRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
