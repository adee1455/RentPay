import { WagmiConfig } from "wagmi";
import config from "../lib/wagmi";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}
