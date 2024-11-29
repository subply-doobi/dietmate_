import colors from "@/shared/colors";
import { IIamportPayParams } from "@/shared/utils/screens/order/setPayData";

export const getPaymentHtmlContent = (iamportPayParams: IIamportPayParams) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>payV2</title>
      <script src="https://cdn.portone.io/v2/browser-sdk.js"></script>
      <style>
        #loading {
          flex-direction: column;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 14px;
          font-weight: regular;
          color: #444444;
          row-gap: 16px;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border-left-color: ${colors.main};
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="loading">
        <div class="spinner"></div>
        <div>잠시만 기다려주세요...</div>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', async function () {
          // 결제창 호출
          const response = await PortOne.requestPayment(${JSON.stringify(
            iamportPayParams
          )});
        });
      </script>
    </body>
    </html>
  `;
};
