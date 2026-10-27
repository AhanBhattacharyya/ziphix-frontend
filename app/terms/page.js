import LegalPage from "../components/LegalPage";

export const metadata = { title: "Terms & Conditions | ZIPHIX" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      sections={[
        { title: "1. Acceptance of Terms", paragraphs: ["By accessing ZIPHIX, you agree to these terms. ZIPHIX is a marketplace platform that connects customers with independent local technicians. We do not directly provide repair services."] },
        { title: "2. The ₹199 Base Fee", paragraphs: ["The ₹199 base fee is a non-refundable booking and visit fee. It covers the technician's travel and diagnostic time. It does not cover the cost of parts or the actual repair."] },
        { title: "3. Independent Contractors", paragraphs: ["All technicians on ZIPHIX are independent contractors. They are not employees of ZIPHIX. While we verify their IDs, ZIPHIX is not liable for any damage caused to your property during the repair."] },
        { title: "4. Pricing", paragraphs: ["While we strive for fixed pricing, if a technician discovers a larger issue, they must provide a revised quote before proceeding. You have the right to refuse the revised quote."] },
      ]}
    />
  );
}