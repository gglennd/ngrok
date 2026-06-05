# @gglennd/ngrok

Vite plugin for ngrok tunneling. Expose your local Vite dev server to the internet with a single line of configuration.

## Installation

```bash
npm install -D @gglennd/ngrok @ngrok/ngrok
```

## Usage

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import ngrok from "@gglennd/ngrok";

export default defineConfig({
  plugins: [
    ngrok({
      authtoken: process.env.NGROK_AUTHTOKEN,
    }),
  ],
});
```

## Configuration

The plugin accepts all options from `@ngrok/ngrok`'s `Config` type, plus a few additional options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enable or disable ngrok tunneling |
| `addr` | `number \| string` | Vite server port | Port or address to tunnel |
| `verbose` | `boolean` | `true` | Log ngrok events to console |
| `authtoken` | `string` | `undefined` | ngrok authtoken (or set `NGROK_AUTHTOKEN` env var) |

All other [ngrok configuration options](https://ngrok.com/docs/ngrok-agent/config/) are passed through.

## Environment Variables

- `NGROK_AUTHTOKEN` — Your ngrok authtoken. Get one at [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

## License

MIT
