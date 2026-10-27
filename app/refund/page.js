import LegalPage from "../components/LegalPage";

export const metadata = { title: "Refund & Cancellation Policy | ZIPHIX" };

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      sections={[
        { title: "1. Base Fee Refund", paragraphs: ["The ₹199 booking fee is fully refundable only if no technician is available to visit your location, or if you cancel within 5 minutes of booking."] },
        { title: "2. Repair Cost Refunds", paragraphs: ["If a repair fails within 7 days, ZIPHIX will coordinate with the technician to fix it for free. If a refund is agreed upon, it will be processed within 5-7 business days."] },
        { title: "3. Cancellations by Technician", paragraphs: ["If a technician fails to show up, your ₹199 fee will be instantly refunded, and we will provide a priority slot for your next booking."] },
      ]}
    />
  );
}