import { AccountsIllustration, HeroIllustration, SecurityIllustration } from './illustrations'
import './HomePage.css'

const securityFeatures = [
  {
    title: 'Bank-level encryption',
    description:
      'Every request between your device and our servers is encrypted end-to-end, so your account details stay private.',
  },
  {
    title: 'Real-time fraud monitoring',
    description:
      'Every deposit and withdrawal is checked automatically, so unusual activity gets flagged before it becomes a problem.',
  },
  {
    title: 'Multi-factor authentication',
    description:
      'Sign in with more than just a password. An extra verification step keeps your account safe even if your password leaks.',
  },
]

const managementFeatures = [
  {
    title: 'Real-time balances',
    description: 'Your checking and savings balances update the moment a transaction clears.',
  },
  {
    title: 'Full transaction history',
    description: 'Every deposit and withdrawal is logged, so you can see exactly where your money went.',
  },
  {
    title: 'Multiple accounts, one login',
    description: 'Open both checking and savings accounts and manage them side by side from a single dashboard.',
  },
]

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>Banking that puts you back in control</h1>
          <p className="hero-subtitle">
            Track balances, review transactions, and manage every account you own from one simple
            dashboard.
          </p>
          <a className="btn btn-primary btn-lg" href="/login">
            Log in to your account
          </a>
        </div>
        <div className="hero-illustration">
          <HeroIllustration />
        </div>
      </section>

      <section className="feature-section">
        <div className="feature-section-header">
          <div className="section-illustration section-illustration-sm">
            <SecurityIllustration />
          </div>
          <h2>Security you can trust</h2>
          <p>We treat your money and your data with the same level of care.</p>
        </div>
        <div className="feature-grid">
          {securityFeatures.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-section feature-section-alt">
        <div className="feature-section-header">
          <div className="section-illustration">
            <AccountsIllustration />
          </div>
          <h2>Manage every account in one place</h2>
          <p>No spreadsheets, no guesswork — just a clear view of where you stand.</p>
        </div>
        <div className="feature-grid">
          {managementFeatures.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default HomePage
