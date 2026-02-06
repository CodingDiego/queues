import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    typedEnv: true,
  },
};

export default withWorkflow(nextConfig);
