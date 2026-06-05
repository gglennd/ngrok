import type { Config, Listener } from "@ngrok/ngrok";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

import _ngrok from "@ngrok/ngrok";

export interface NgrokPluginOptions extends Omit<Config, "addr"> {
  /**
   * Enable or disable ngrok tunneling
   * @default true
   */
  enabled?: boolean;

  /**
   * Port or address to tunnel (defaults to Vite dev server port)
   */
  addr?: number | string;

  /**
   * Log ngrok events to console
   * @default true
   */
  verbose?: boolean;
}

export default function ngrok(options: NgrokPluginOptions = {}): Plugin {
  const {
    enabled = true,
    addr,
    verbose = true,
    ...ngrokConfig
  } = options;

  let config: ResolvedConfig;
  let server: ViteDevServer;
  let listener: Listener;
  let url = "";

  const log = (message: string) => {
    if (verbose && config.logger) {
      config.logger.info(`[ngrok] ${message}`);
    }
  };

  const error = (message: string) => {
    if (config.logger) {
      config.logger.error(`[ngrok] ${message}`);
    }
  };

  async function startTunnel(port: number) {
    const forwardConfig: Config = {
      addr: port,
      authtoken_from_env: !ngrokConfig.authtoken,
      ...ngrokConfig,
    };

    try {
      log("Starting ngrok tunnel...");

      listener = await _ngrok.forward(forwardConfig);
      url = listener.url() ?? "";

      if (!url) {
        error("Failed to get ngrok URL");
        return;
      }

      const hostname = new URL(url).hostname;

      if (config.server.allowedHosts !== true) {
        const hosts = Array.isArray(config.server.allowedHosts)
          ? config.server.allowedHosts
          : [];
        config.server.allowedHosts = [...hosts, hostname];
      }

      if (server.resolvedUrls) {
        server.resolvedUrls.network.push(url);
      }
    }
    catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("ERR_NGROK_4018") || message.includes("authtoken")) {
        error("No authtoken found. Set NGROK_AUTHTOKEN env var or pass authtoken option.");
        error("Get your token: https://dashboard.ngrok.com/get-started/your-authtoken");
      }
      else {
        error(`Failed to start tunnel: ${message}`);
      }
    }
  }

  return {
    name: "vite-plugin-ngrok",

    apply: (_config, { command, mode }) =>
      enabled && command === "serve" && mode !== "test",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async configureServer(devServer) {
      server = devServer;

      const tunnelAddr = addr ?? config.server.port ?? 5173;
      await startTunnel(Number(tunnelAddr));

      server.httpServer?.on("listening", () => {
        if (url && server.resolvedUrls) {
          server.resolvedUrls.network.push(url);
        }
      });

      server.httpServer?.on("close", () => listener?.close());
    },
  };
}
