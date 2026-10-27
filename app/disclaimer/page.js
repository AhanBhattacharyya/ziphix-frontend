import LegalPage from "../components/LegalPage";

export const metadata = { title: "Disclaimer | ZIPHIX" };

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      sections={[
        { title: "Platform and Service Disclaimer", paragraphs: ["ZIPHIX is a technology platform. We do not manufacture parts, nor do we employ the technicians. All warranties regarding the physical repair are provided by the independent technician. ZIPHIX's liability is strictly limited to the platform facilitation fee collected."] },
      ]}
    />
  );
}