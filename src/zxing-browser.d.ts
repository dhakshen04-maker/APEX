import "@zxing/browser";

declare module "@zxing/browser" {
  interface BrowserQRCodeReader {
    reset(): void;
  }
}
