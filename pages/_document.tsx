import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Anfiteatro Audit Dashboard - Real-time audit tracking" />
      </Head>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
