import LegalPage from "../components/LegalPage";

export const metadata = { title: "Privacy Policy | ZIPHIX" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        { title: "1. Information We Collect", paragraphs: ["When you log in via Google, we collect your Name and Email. We also ask for your Phone and WhatsApp numbers to coordinate the repair."] },
        { title: "2. How We Use Data", paragraphs: ["Your data is stored securely in our database (Supabase). We use it strictly to connect you with technicians, process payments, and send booking updates. We do not sell your data to third parties."] },
        { title: "3. Data Deletion", paragraphs: ["You may request the deletion of your account and data by emailing support@ziphix.in."] },
      ]}
    />
  );
}