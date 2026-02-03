import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps): ReactNode {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--chrome-bg-accent)] via-[#ffffff] to-[var(--chrome-border-glow)] rounded-2xl opacity-75 group-hover:opacity-100 transition duration-500 blur-sm"></div>
      <div className="relative bg-gradient-to-br from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-muted)] p-8 rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-[var(--chrome-bg-elevated)] via-[var(--chrome-bg-accent)] to-[var(--chrome-bg-chrome-dark)] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.1)] border border-white/60">
          <span className="text-2xl bg-gradient-to-b from-[var(--chrome-text-secondary)] to-[var(--chrome-text-disabled)] bg-clip-text text-transparent">
            {icon}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-3 bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-[var(--chrome-text-muted)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function LandingPage(): ReactNode {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--chrome-bg-page)] via-[#ffffff] to-[var(--chrome-bg-page-end)] overflow-hidden">
      {/* Ambient chrome reflections */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-gradient-radial from-white/40 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] bg-gradient-radial from-[#e8eaed]/30 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--chrome-bg-muted)] via-[var(--chrome-bg-inset)] to-[var(--chrome-bg-chrome-darkest)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.1)] border border-white/50 flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-b from-[var(--chrome-text-body)] to-[var(--chrome-text-tertiary)] bg-clip-text text-transparent">C</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-[var(--chrome-text-primary)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
              CohortBuilder
            </span>
          </div>
          <Link to="/builder">
            <button className="px-6 py-2.5 rounded-full bg-gradient-to-b from-[var(--chrome-bg-elevated)] to-[var(--chrome-bg-accent)] border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] text-[var(--chrome-text-body)] font-medium hover:shadow-[0_4px_16px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300">
              Launch App
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 px-8 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main heading with chrome effect */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-b from-[var(--chrome-text-heading-primary)] via-[var(--chrome-text-heading-mid)] to-[var(--chrome-text-heading-light)] bg-clip-text text-transparent drop-shadow-sm">
              Build Patient Cohorts
            </span>
            <br />
            <span className="bg-gradient-to-b from-[var(--chrome-text-tertiary)] via-[var(--chrome-text-subtle)] to-[var(--chrome-text-disabled)] bg-clip-text text-transparent">
              with Precision
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--chrome-text-muted)] max-w-3xl mx-auto mb-12 leading-relaxed">
            Empower clinical trial managers to identify eligible patients,
            build precise cohorts, and populate eCRF forms directly from EHR data.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/builder">
              <button className="group relative px-10 py-4 rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--chrome-btn-dark-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-dark-to)] rounded-2xl"></div>
                <div className="absolute inset-[1px] bg-gradient-to-b from-[var(--chrome-btn-inner-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-inner-to)] rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-white drop-shadow-sm">Start Building</span>
              </button>
            </Link>
            <a href="#features" className="px-10 py-4 rounded-2xl font-semibold text-lg text-[var(--chrome-text-secondary)] bg-gradient-to-b from-white to-[var(--chrome-bg-hover)] border border-[var(--chrome-border-default)] shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.02]">
              Learn More
            </a>
          </div>
        </div>
      </header>

      {/* Chrome divider */}
      <div className="relative h-px mx-auto max-w-4xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--chrome-border-divider)] to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-y-[1px]"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-8 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
              Streamline Clinical Trials
            </h2>
            <p className="text-xl text-[var(--chrome-text-muted)] max-w-2xl mx-auto">
              From patient identification to data capture, accelerate your research workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🔍"
              title="Smart Cohort Builder"
              description="Define complex eligibility criteria using SNOMED CT codes, demographics, and clinical observations. Find the right patients for your trial instantly."
            />
            <FeatureCard
              icon="📋"
              title="eCRF Auto-Population"
              description="Automatically fill electronic Case Report Forms with verified EHR data. Reduce manual entry errors and save countless hours of data transcription."
            />
            <FeatureCard
              icon="🔗"
              title="FHIR R4 Native"
              description="Built on the HL7 FHIR R4 standard for seamless integration with modern EHR systems. Query patients, conditions, medications, and observations."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--chrome-bg-inset)] via-white to-[var(--chrome-bg-inset)] rounded-3xl blur-sm"></div>
            <div className="relative bg-gradient-to-br from-white via-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)] rounded-3xl p-12 border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="grid md:grid-cols-3 gap-12 text-center">
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent mb-2">
                    500K+
                  </div>
                  <div className="text-[var(--chrome-text-tertiary)]">SNOMED CT Concepts</div>
                </div>
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent mb-2">
                    FHIR R4
                  </div>
                  <div className="text-[var(--chrome-text-tertiary)]">Standard Compliant</div>
                </div>
                <div>
                  <div className="text-5xl font-bold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent mb-2">
                    Real-time
                  </div>
                  <div className="text-[var(--chrome-text-tertiary)]">EHR Integration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Define Criteria', description: 'Set your inclusion criteria using age, gender, conditions, medications, and lab values.' },
              { step: '02', title: 'Search Patients', description: 'Query your FHIR server in real-time to find patients matching your criteria.' },
              { step: '03', title: 'Review & Export', description: 'Examine patient details, verify eligibility, and export data for your eCRF.' },
            ].map((item, index) => (
              <div key={index} className="group flex items-start gap-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--chrome-bg-elevated)] via-[var(--chrome-bg-accent)] to-[var(--chrome-bg-chrome-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.1)] border border-white/60 flex items-center justify-center">
                  <span className="text-xl font-bold bg-gradient-to-b from-[var(--chrome-text-body)] to-[var(--chrome-text-tertiary)] bg-clip-text text-transparent">
                    {item.step}
                  </span>
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-body)] bg-clip-text text-transparent">
                    {item.title}
                  </h3>
                  <p className="text-lg text-[var(--chrome-text-muted)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
            Ready to Accelerate Your Research?
          </h2>
          <p className="text-xl text-[var(--chrome-text-muted)] mb-12 max-w-2xl mx-auto">
            Start building patient cohorts with precision and efficiency.
            Your next breakthrough begins here.
          </p>
          <Link to="/builder">
            <button className="group relative px-14 py-5 rounded-2xl font-semibold text-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--chrome-btn-dark-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-dark-to)] rounded-2xl"></div>
              <div className="absolute inset-[1px] bg-gradient-to-b from-[var(--chrome-btn-inner-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-inner-to)] rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative text-white drop-shadow-sm">Launch CohortBuilder</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-[var(--chrome-border-light)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--chrome-bg-muted)] via-[var(--chrome-bg-inset)] to-[var(--chrome-bg-chrome-darkest)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.08)] border border-white/50 flex items-center justify-center">
              <span className="text-sm font-bold bg-gradient-to-b from-[var(--chrome-text-body)] to-[var(--chrome-text-tertiary)] bg-clip-text text-transparent">C</span>
            </div>
            <span className="text-[var(--chrome-text-tertiary)]">CohortBuilder</span>
          </div>
          <div className="text-sm text-[var(--chrome-text-disabled)]">
            FHIR R4 Compatible | SNOMED CT Enabled | Built for Clinical Research
          </div>
        </div>
      </footer>

      {/* Custom styles for gradient background */}
      <style>{`
        .bg-gradient-radial {
          background: radial-gradient(ellipse at center, var(--tw-gradient-from), var(--tw-gradient-to));
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
