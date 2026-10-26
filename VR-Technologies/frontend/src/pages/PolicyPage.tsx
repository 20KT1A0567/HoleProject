import { Link } from 'react-router-dom'
import { Shield, RotateCcw, Lock, FileText, ChevronRight } from 'lucide-react'

type PolicyType = 'warranty' | 'returns' | 'privacy' | 'terms'

interface Props {
  type: PolicyType
}

const POLICY_DATA: Record<PolicyType, {
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
  lastUpdated: string
  sections: { heading: string; content: string[] }[]
}> = {
  warranty: {
    title: 'Warranty Policy',
    subtitle: 'Understanding your product warranty',
    icon: Shield,
    color: 'text-blue-600',
    lastUpdated: 'December 1, 2024',
    sections: [
      {
        heading: 'Warranty Coverage',
        content: [
          'All products sold by VR Technologies come with a standard 6-month warranty from the date of purchase.',
          'The warranty covers hardware defects including motherboard failures, RAM issues, display problems, keyboard malfunctions, and storage drive failures.',
          'The warranty is valid across all 4 VR Technologies store locations in Hyderabad and Guntur.',
          'Products are eligible for free repair or replacement within the warranty period at our discretion.',
        ],
      },
      {
        heading: 'What Is Not Covered',
        content: [
          'Physical damage caused by the customer (drops, spills, cracks, etc.).',
          'Damage caused by unauthorized repair or modification.',
          'Software issues, operating system reinstallation, or virus removal.',
          'Consumables such as batteries showing normal wear and degradation.',
          'Products with tampered or removed warranty stickers.',
          'Damage caused by power surges, incorrect voltage, or improper use.',
        ],
      },
      {
        heading: 'How to Claim Warranty',
        content: [
          'Visit any VR Technologies store with your original purchase receipt or invoice.',
          'Our technicians will diagnose the issue (typically within 24 hours).',
          'If covered under warranty, repairs will be completed free of charge within 7 business days.',
          'For replacement, a like-for-like or upgraded product will be provided subject to availability.',
          'You can also contact us via WhatsApp or call before visiting for pre-assessment.',
        ],
      },
      {
        heading: 'Extended Warranty',
        content: [
          'Extended warranty plans are available for purchase at the time of buying the product.',
          '12-month extended warranty plans are available for eligible products.',
          'Contact any of our stores for extended warranty pricing and terms.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds Policy',
    subtitle: 'Easy, hassle-free returns for your peace of mind',
    icon: RotateCcw,
    color: 'text-orange-600',
    lastUpdated: 'December 1, 2024',
    sections: [
      {
        heading: '7-Day Return Policy',
        content: [
          'VR Technologies offers a 7-day no-questions-asked return policy on all products.',
          'Products can be returned to any VR Technologies store within 7 days of delivery or purchase.',
          'For online orders, a pickup can be scheduled by contacting our support team.',
          'The product must be in its original condition with all accessories, manuals, and packaging.',
        ],
      },
      {
        heading: 'Refund Process',
        content: [
          'Once the returned product is inspected and approved, refund will be processed within 5-7 business days.',
          'Refunds are issued via the original payment method (UPI, bank transfer, card reversal, or cash).',
          'COD orders will receive refund via bank transfer or UPI to the registered account.',
          'Store credit can be issued immediately for in-store returns.',
        ],
      },
      {
        heading: 'Non-Returnable Items',
        content: [
          'Products returned after 7 days from delivery are not eligible for return (warranty applies instead).',
          'Products with physical damage caused by the customer are not eligible for return.',
          'Software products, accessories with broken packaging, and consumables cannot be returned.',
          'Custom-configured or upgraded products may have different return terms — check at the time of purchase.',
        ],
      },
      {
        heading: 'Exchange Policy',
        content: [
          'If you receive a product different from what was ordered, we will exchange it at no charge.',
          'Exchange for a different model or specification is subject to price difference.',
          'Exchanges can be processed at any VR Technologies store location.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your data',
    icon: Lock,
    color: 'text-purple-600',
    lastUpdated: 'December 1, 2024',
    sections: [
      {
        heading: 'Information We Collect',
        content: [
          'Personal information: name, email address, phone number, delivery address when you register or place an order.',
          'Transaction data: order history, products viewed, cart contents, and payment method preferences.',
          'Device & usage data: browser type, IP address, pages visited, time spent on site (collected via cookies).',
          'We do NOT store credit/debit card numbers. Payments are processed by secure third-party payment gateways.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        content: [
          'To process and fulfill your orders, send order confirmations, and provide tracking updates.',
          'To send promotional offers, new arrivals, and deals (you can opt out at any time).',
          'To improve our website experience and product recommendations.',
          'To comply with legal and regulatory requirements.',
          'To prevent fraud and ensure security of our platform.',
        ],
      },
      {
        heading: 'Data Sharing',
        content: [
          'We do not sell your personal information to third parties.',
          'We share data only with delivery partners and payment gateways strictly for order fulfillment.',
          'We may disclose information if required by law or legal process.',
          'Aggregated, anonymized data may be used for analytics.',
        ],
      },
      {
        heading: 'Your Rights',
        content: [
          'You can request access to your personal data at any time.',
          'You can request correction of inaccurate data.',
          'You can request deletion of your account and associated data.',
          'You can opt out of marketing communications by clicking "Unsubscribe" in any email.',
          'Contact us at privacy@vrtechnologies.in for any data requests.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Terms of use for VR Technologies website and services',
    icon: FileText,
    color: 'text-green-600',
    lastUpdated: 'December 1, 2024',
    sections: [
      {
        heading: 'Acceptance of Terms',
        content: [
          'By accessing and using the VR Technologies website and services, you agree to be bound by these terms and conditions.',
          'These terms apply to all visitors, users, and customers of our website and physical stores.',
          'We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.',
          'If you do not agree with any part of these terms, please do not use our services.',
        ],
      },
      {
        heading: 'Product Listings & Pricing',
        content: [
          'All prices on our website are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.',
          'Prices and availability are subject to change without notice.',
          'Product images are for illustration purposes. Actual products may vary slightly in appearance.',
          'We reserve the right to cancel orders in case of pricing errors or stock unavailability.',
          'Promotional offers and discounts are time-limited and subject to terms specified for each offer.',
        ],
      },
      {
        heading: 'User Accounts',
        content: [
          'You are responsible for maintaining the confidentiality of your account credentials.',
          'You must provide accurate and current information when creating an account.',
          'One account per person. Multiple accounts for the same person may be suspended.',
          'VR Technologies reserves the right to suspend or terminate accounts that violate our terms.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        content: [
          'VR Technologies\' liability is limited to the value of the purchased product.',
          'We are not liable for indirect, incidental, or consequential damages.',
          'We are not responsible for delays caused by courier services or force majeure events.',
          'All warranties are as stated in our Warranty Policy. No additional warranties are implied.',
        ],
      },
      {
        heading: 'Governing Law',
        content: [
          'These terms are governed by the laws of India, specifically applicable laws in Telangana state.',
          'Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.',
          'For any concerns, please contact us at legal@vrtechnologies.in before initiating legal proceedings.',
        ],
      },
    ],
  },
}

export default function PolicyPage({ type }: Props) {
  const policy = POLICY_DATA[type]
  const Icon = policy.icon

  const relatedPolicies = [
    { type: 'warranty', label: 'Warranty Policy', href: '/warranty-policy' },
    { type: 'returns', label: 'Returns & Refunds', href: '/returns' },
    { type: 'privacy', label: 'Privacy Policy', href: '/privacy' },
    { type: 'terms', label: 'Terms & Conditions', href: '/terms' },
  ].filter((p) => p.type !== type)

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#07111F] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{policy.title}</h1>
          <p className="text-gray-400">{policy.subtitle}</p>
          <p className="text-xs text-gray-600 mt-3">Last updated: {policy.lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Contents</h3>
              <ul className="space-y-1">
                {policy.sections.map((section, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 py-1.5 transition-colors"
                    >
                      <ChevronRight size={13} />
                      <span>{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Other Policies</p>
                <ul className="space-y-1">
                  {relatedPolicies.map((p) => (
                    <li key={p.type}>
                      <Link
                        to={p.href}
                        className="text-sm text-green-600 hover:text-green-700 hover:underline block py-1"
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Policy content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Intro box */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                type === 'warranty' ? 'bg-blue-50' : type === 'returns' ? 'bg-orange-50' : type === 'privacy' ? 'bg-purple-50' : 'bg-green-50'
              }`}>
                <Icon size={24} className={policy.color} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">{policy.title}</h2>
                <p className="text-sm text-gray-500">
                  This policy is effective as of {policy.lastUpdated} and applies to all products and services offered by VR Technologies across all channels including our website, mobile app, and physical stores.
                </p>
              </div>
            </div>

            {/* Sections */}
            {policy.sections.map((section, i) => (
              <div
                key={i}
                id={`section-${i}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${policy.color}`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    type === 'warranty' ? 'bg-blue-100' : type === 'returns' ? 'bg-orange-100' : type === 'privacy' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {i + 1}
                  </span>
                  {section.heading}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((point, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="bg-[#07111F] rounded-2xl p-6 text-center">
              <h3 className="text-white font-bold text-lg mb-2">Have Questions?</h3>
              <p className="text-gray-400 text-sm mb-5">
                If you have any questions about our policies, feel free to reach out to us.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/contact" className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                  Contact Support
                </Link>
                <a href="https://wa.me/919100012345" target="_blank" rel="noopener noreferrer"
                  className="border border-gray-600 hover:border-green-500 text-white hover:text-green-400 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
