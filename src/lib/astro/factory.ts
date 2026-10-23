import { isDemoMode } from "@/lib/config/demo";
import { AstroProvider } from "./types";
import { DemoAstroProvider } from "./demo";
import { AstroSageProvider } from "./astrosage";

export function getAstroProvider(): AstroProvider {
  if (process.env.NODE_ENV === "production" && !isDemoMode()) {
    return new AstroSageProvider();
  }
  return new DemoAstroProvider();
}
