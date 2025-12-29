
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const TermsAndConditionPage = () => {
  return (
    <div className="min-h-screen bg-background">
    
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">← Back to Home</Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions and Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Terms and Conditions Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-primary">Terms and Conditions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. Use License</h3>
              <p className="text-muted-foreground leading-relaxed">
                Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. User Responsibilities</h3>
              <p className="text-muted-foreground leading-relaxed">
                Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. Disclaimer</h3>
              <p className="text-muted-foreground leading-relaxed">
                The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Limitations</h3>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Modifications</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-primary">Privacy Policy</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Profile information</li>
                <li>Communications with us</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. Information Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">
                We do not share your personal information with third parties except as described in this privacy policy. We may share information with service providers who perform services on our behalf, subject to confidentiality obligations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Cookies and Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Your Rights</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7. Contact Us</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms and Conditions or Privacy Policy, please contact us through the contact information provided on our website.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-primary">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                How do I create an account?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Click on the "Join for Free" button in the header. Fill in your details including name, email, and password. Verify your email address through the link sent to your inbox, and you're all set to start using our platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Is my personal information secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, we take data security very seriously. We use industry-standard encryption and security measures to protect your personal information. Your data is stored securely and we never share it with third parties without your consent.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Can I delete my account?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, you can delete your account at any time from your account settings. Please note that this action is permanent and all your data will be removed from our servers. If you have any concerns, please contact our support team first.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                How do you use cookies on this website?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser preferences. Essential cookies are necessary for the website to function properly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                What happens if the terms are updated?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We may update our Terms and Conditions from time to time. When we make significant changes, we will notify you via email or through a notice on our website. Continued use of our services after changes are posted constitutes acceptance of the updated terms.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                How can I contact support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can reach our support team through the contact form on our website, or email us directly at the email address provided in the Contact Us section. We typically respond within 24-48 hours during business days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                Can I use this service for commercial purposes?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The use license is primarily for personal, non-commercial use. If you wish to use our services for commercial purposes, please contact us to discuss appropriate licensing arrangements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                What rights do I have over my personal data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You have the right to access, correct, delete, or transfer your personal data. You can also object to processing and withdraw consent at any time. To exercise these rights, please contact us through the contact information provided on our website.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </div>
  );
};

export default TermsAndConditionPage;
