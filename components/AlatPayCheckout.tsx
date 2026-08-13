import { WebView } from "react-native-webview";

interface AlatPayCheckoutProps {
  payment: {
    checkout: {
      api_key: string;
      business_id: string;
      email: string;
      phone: string;
      first_name: string;
      last_name: string;
      currency: string;
      amount: number;
      metadata?: Record<string, unknown>;
      script_url: string;
    };
  };
  onResult: (response: any) => void;
  onClose: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onReady?: () => void;
  onError?: (message: string) => void;
}

export default function AlatPayCheckout(
  {
    payment,
    onResult,
    onClose,
    onLoadStart,
    onLoadEnd,
    onReady,
    onError
  }: AlatPayCheckoutProps) {
  const checkout = payment.checkout;
  const configObject = {
    api_key: checkout.api_key,
    apiKey: checkout.api_key,
    public_key: checkout.api_key,
    publicKey: checkout.api_key,
    business_id: checkout.business_id,
    businessId: checkout.business_id,
    email: checkout.email,
    phone: checkout.phone,
    first_name: checkout.first_name,
    firstName: checkout.first_name,
    last_name: checkout.last_name,
    lastName: checkout.last_name,
    currency: checkout.currency,
    amount: checkout.amount,
    metadata: checkout.metadata || {},
    color: "#0B4A8B",
  };

  const config = JSON.stringify(configObject).replace(/</g, "\\u003c");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport"
              content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <script src="${checkout.script_url}"></script>
        <script>
          const config = ${config};

          function send(type, payload) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type, payload })
            );
          }

          window.addEventListener("load", function() {
          
            if (!window.Alatpay || typeof window.Alatpay.setup !== "function") {
              send("error", {
                message: "AlatPay SDK did not load or setup() is unavailable.",
                hasAlatpay: !!window.Alatpay
              });
              return;
            }

            const popup = window.Alatpay.setup({
              ...config,
              onTransaction: function(response) {
                send("transaction", response);
              },
              onClose: function() {
                send("closed", {});
              }
            });

            popup.show();
            send("ready", {});
          });
        </script>
      </body>
    </html>
  `;

  

  return (
      <WebView
      source={{ html, baseUrl: "https://web.alatpay.ng" }}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={["https://*", "http://*", "about:blank"]}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onMessage={(event) => {
        let message;

        try {
          message = JSON.parse(event.nativeEvent.data);
        } catch (error) {
          return;
        }

        if (message.type === "closed") {
          onClose();
          return;
        }

        if (message.type === "transaction") {
          onResult(message.payload);
          return;
        }

        if (message.type === "ready") {
          onReady?.();
          return;
        }

        if (message.type === "error") {
          onError?.(
            typeof message.payload?.message === "string"
              ? message.payload.message
              : "AlatPay checkout failed to initialize."
          );
        }
      }}
    />
  );
}
