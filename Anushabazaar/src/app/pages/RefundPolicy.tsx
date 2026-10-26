import { PolicyDocumentPage } from "../components/PolicyDocumentPage";

export function RefundPolicy() {
  return (
    <PolicyDocumentPage
      type="RETURNS_REFUNDS"
      title="Refund policy"
      subtitle="Returns, refunds and cancellation details"
      accent="green"
    />
  );
}
