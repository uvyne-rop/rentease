import { Link } from 'react-router-dom'

export default function MeetTheTeamPage() {
  const team = [
    {
      name: 'Property Specialists',
      role: 'Listings & Verification',
      bio: 'Our dedicated property specialists personally visit and verify every listing before it goes live. With deep knowledge of the Kenyan rental market, we ensure quality, accuracy, and fair pricing across all our properties.',
      emoji: '🏠',
    },
    {
      name: 'Client Relations',
      role: 'Customer Support',
      bio: 'Our client relations team is always on hand to connect tenants with the right landlords, answer questions, and ensure a smooth rental experience from first search all the way through to signing.',
      emoji: '🤝',
    },
    {
      name: 'Marketing & Listings',
      role: 'Property Photography & Promotion',
      bio: 'We showcase every property in its best light — professional photography, accurate descriptions, and targeted promotion to ensure landlords get quality tenants fast.',
      emoji: '📸',
    },
    {
      name: 'Legal & Compliance',
      role: 'Tenancy Agreements & Advisory',
      bio: 'Our compliance team ensures every listing meets Kenyan housing standards and helps both landlords and tenants understand their rights and obligations under Kenyan tenancy law.',
      emoji: '⚖️',
    },
  ]

  const values = [
    { icon: '🔍', title: 'Transparency', desc: 'No hidden fees. What you see is what you pay.' },
    { icon: '✅', title: 'Verification', desc: 'Every property is personally inspected before listing.' },
    { icon: '💬', title: 'Responsiveness', desc: 'We reply promptly — your time matters.' },
    { icon: '🇰🇪', title: 'Local Expertise', desc: 'Born and based in Kenya, built for Kenyans.' },
  ]

  return (
    <div className="pt-16 lg:pt-20 min-h-screen">

      <div className="relative bg-gradient-to-br from-primary-700 to-primary-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-5xl font-bold font-display mb-5">About Us</h1>
          <p className="text-xl text-primary-200 leading-relaxed">
            Connecting Kenyans to their perfect homes since 2022.
          </p>
        </div>
      </div>

     

      {/* Team Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 font-display mb-3">Our Departments</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Each team works together to make your property search as smooth and stress-free as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map(member => (
            <div key={member.name}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:bg-primary-100 transition-colors">
                  {member.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display mb-0.5">{member.name}</h3>
                  <p className="text-sm text-primary-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 font-display mb-3">What We Stand For</h2>
            <p className="text-slate-500">The values that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-primary-50 rounded-2xl p-10 border border-primary-100">
          <div className="text-5xl mb-5">📞</div>
          <h2 className="text-3xl font-bold text-slate-900 font-display mb-3">Want to Talk to Us?</h2>
          <p className="text-slate-600 mb-2">Our team is ready to help you find your perfect home in Kenya.</p>
          <p className="text-slate-500 text-sm mb-8">
            Call us on <a href="tel:+254798641087" className="text-primary-700 font-bold hover:text-primary-900">+254798641087</a> or
            email <a href="mailto:agencyrentease@gmail.com" className="text-primary-700 font-bold hover:text-primary-900">agencyrentease@gmail.com</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary inline-flex items-center justify-center gap-2">
              📩 Send Us a Message
            </Link>
            <Link to="/listings" className="btn-secondary inline-flex items-center justify-center gap-2">
              🏠 Browse Listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}