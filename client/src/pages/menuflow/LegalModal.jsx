import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { MF } from './mfTheme';

const M = motion.create(Box);
const EFFECTIVE_DATE = 'July 10, 2026';

const TERMS_SECTIONS = [
  {
    heading: 'Acceptance of Terms',
    body: 'By creating an account, accessing, or using ScanIt ("the Platform", "we", "us"), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you are using ScanIt on behalf of a restaurant or business, you confirm that you have the authority to bind that business to these terms. If you do not agree, you must not use the Platform.',
  },
  {
    heading: 'The ScanIt Platform',
    body: 'ScanIt provides digital menu, QR ordering, and restaurant operations tools, including menu management, order handling, inventory tracking, and related administrative features. We may add, modify, or discontinue individual features at any time to improve the service.',
  },
  {
    heading: 'Account Registration',
    body: 'Restaurant accounts on ScanIt are provisioned by our team or an authorized administrator — the Platform does not currently support open self-registration. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.',
  },
  {
    heading: 'Subscriptions, Fees & Billing',
    body: 'Access to paid features is provided on a subscription basis as agreed at onboarding. Fees are billed in advance for the applicable billing cycle and are non-refundable except where required by law. We may change pricing with reasonable advance notice; continued use of the Platform after a price change takes effect constitutes acceptance of the new pricing.',
  },
  {
    heading: 'Acceptable Use',
    body: 'You agree not to: (a) use the Platform for any unlawful purpose; (b) upload menu content, images, or descriptions that are misleading, infringing, or offensive; (c) attempt to interfere with, disrupt, or gain unauthorized access to the Platform or its underlying infrastructure; (d) resell or sublicense access to the Platform without our written consent; or (e) reverse-engineer or copy the Platform\'s software.',
  },
  {
    heading: 'Menu Content & Intellectual Property',
    body: 'You retain ownership of the menu content, images, and business information you upload to ScanIt ("Your Content"). You grant us a limited, non-exclusive license to host, display, and process Your Content solely to operate and provide the Platform to you and your customers. The ScanIt name, logo, software, and platform design remain our exclusive intellectual property.',
  },
  {
    heading: 'Third-Party Services & Integrations',
    body: 'ScanIt relies on trusted third-party providers for functions such as payment processing, cloud storage, email delivery, and SMS/OTP verification. Your use of these integrated services may also be subject to that provider\'s own terms. We are not responsible for outages or issues originating from third-party providers outside our control.',
  },
  {
    heading: 'Service Availability',
    body: 'We aim to keep the Platform available at all times but do not guarantee uninterrupted access. Scheduled maintenance, updates, or events outside our reasonable control (including third-party provider outages) may cause temporary downtime.',
  },
  {
    heading: 'Termination',
    body: 'We may suspend or terminate access to the Platform if these Terms are violated, fees remain unpaid, or continued use poses a security or legal risk. You may request account closure at any time by contacting us; certain records may be retained as required by law or for legitimate business purposes.',
  },
  {
    heading: 'Disclaimer of Warranties',
    body: 'The Platform is provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.',
  },
  {
    heading: 'Limitation of Liability',
    body: 'To the maximum extent permitted by law, ScanIt and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, arising from your use of the Platform.',
  },
  {
    heading: 'Indemnification',
    body: 'You agree to indemnify and hold ScanIt harmless from any claims, damages, or expenses arising from your misuse of the Platform, violation of these Terms, or infringement of any third-party right through Your Content.',
  },
  {
    heading: 'Changes to These Terms',
    body: 'We may update these Terms from time to time. Material changes will be communicated via the Platform or by email. Continued use of ScanIt after changes take effect constitutes acceptance of the revised Terms.',
  },
  {
    heading: 'Governing Law',
    body: 'These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts having competent authority.',
  },
  {
    heading: 'Contact Us',
    body: 'For questions about these Terms, reach out through our Contact page or email us at the address listed there.',
  },
];

const PRIVACY_SECTIONS = [
  {
    heading: 'Introduction',
    body: 'This Privacy Policy explains how ScanIt collects, uses, shares, and protects information when you use our digital menu and restaurant operations platform, as a restaurant administrator/staff member or as a diner scanning a menu QR code.',
  },
  {
    heading: 'Information We Collect',
    body: 'Account & Business Data: restaurant name, admin contact details, login credentials, and menu/inventory content you provide.\nOrder & Usage Data: orders placed, items viewed, and general usage patterns needed to operate the Platform.\nContact Form Data: name, email, phone number, and message content when you submit an inquiry through our website.\nDevice & Technical Data: IP address, browser type, and similar technical information collected automatically for security and analytics purposes.',
  },
  {
    heading: 'How We Use Your Information',
    body: 'We use collected information to: provide and maintain the Platform; process orders and payments; respond to inquiries and support requests; send transactional emails (such as account credentials or order confirmations); monitor and improve platform performance and security; and comply with legal obligations.',
  },
  {
    heading: 'Cookies & Similar Technologies',
    body: 'We use cookies and similar technologies to keep you signed in, remember preferences, and understand how the Platform is used. You can control cookies through your browser settings; disabling them may affect certain features.',
  },
  {
    heading: 'How We Share Information',
    body: 'We do not sell your personal information. We may share information with: trusted service providers who help us operate the Platform (such as cloud hosting, email delivery, and payment processing partners), acting solely on our instructions; law enforcement or regulators where required by law; and successors in the event of a merger, acquisition, or asset sale, subject to equivalent privacy protections.',
  },
  {
    heading: 'Data Security',
    body: 'We use industry-standard safeguards — including encryption in transit, access controls, and secure infrastructure — to protect your information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
  },
  {
    heading: 'Data Retention',
    body: 'We retain personal information for as long as necessary to provide the Platform, comply with legal obligations, resolve disputes, and enforce our agreements. Contact form submissions and account records are retained in line with these purposes.',
  },
  {
    heading: 'Your Rights',
    body: 'Depending on your location, you may have rights to access, correct, export, or request deletion of your personal information, and to object to or restrict certain processing (including rights available under GDPR and CCPA where applicable). To exercise these rights, contact us through our Contact page.',
  },
  {
    heading: 'International Data Transfers',
    body: 'Your information may be processed and stored in countries other than your own through our hosting and service providers. Where this occurs, we take steps to ensure appropriate safeguards are in place.',
  },
  {
    heading: "Children's Privacy",
    body: 'ScanIt is intended for business use by restaurants and their adult staff, and for diners viewing public menus. We do not knowingly collect personal information from children.',
  },
  {
    heading: 'Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. Material changes will be communicated via the Platform or by email. The "Effective date" above reflects the latest revision.',
  },
  {
    heading: 'Contact Us',
    body: 'For privacy-related questions or requests, reach out through our Contact page.',
  },
];

export default function LegalModal({ type, onClose }) {
  useEffect(() => {
    if (!type) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [type, onClose]);

  const isTerms = type === 'terms';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    <AnimatePresence>
      {type && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } }}>
          <M
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={onClose}
            sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(45,31,24,0.55)', backdropFilter: 'blur(4px)' }}
          />
          <M
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 720 }}
          >
            <Box sx={{
              bgcolor: MF.surfaceLowest, borderRadius: '24px', maxHeight: '85vh',
              display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
              overflow: 'hidden', fontFamily: 'Inter, sans-serif',
            }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: { xs: 3, md: 5 }, py: 3, borderBottom: `1px solid ${MF.outlineVar}55` }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MF.primary, mb: 0.5 }}>ScanIt Legal</Typography>
                  <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900, letterSpacing: '-0.02em', color: MF.text, fontFamily: 'Manrope, Inter, sans-serif' }}>
                    {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
                  </Typography>
                </Box>
                <Box component="button" onClick={onClose} aria-label="Close"
                  sx={{ width: 36, height: 36, borderRadius: '50%', border: 'none', bgcolor: MF.surfaceLow, color: MF.textSub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', '&:hover': { bgcolor: MF.surface, color: MF.primary } }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </Box>
              </Box>

              {/* Body */}
              <Box sx={{ px: { xs: 3, md: 5 }, py: 4, overflowY: 'auto' }}>
                <Typography sx={{ fontSize: 13, color: MF.textSub, mb: 3 }}>Effective date: {EFFECTIVE_DATE}</Typography>
                {sections.map((s, i) => (
                  <Box key={s.heading} sx={{ mb: 3.5, '&:last-of-type': { mb: 0 } }}>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: MF.text, mb: 1 }}>{i + 1}. {s.heading}</Typography>
                    <Typography sx={{ fontSize: 14, color: MF.textSub, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{s.body}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Footer */}
              <Box sx={{ px: { xs: 3, md: 5 }, py: 2.5, borderTop: `1px solid ${MF.outlineVar}55`, display: 'flex', justifyContent: 'flex-end' }}>
                <Box component="button" onClick={onClose}
                  sx={{ background: MF.gradient, color: '#fff', border: 'none', borderRadius: '12px', px: 3.5, py: 1.25, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Got it
                </Box>
              </Box>
            </Box>
          </M>
        </Box>
      )}
    </AnimatePresence>
  );
}
