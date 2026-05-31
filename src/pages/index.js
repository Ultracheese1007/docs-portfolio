import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const cards = [
  {
    title: 'Airflow PoC — Case Study',
    to: '/airflow-poc/overview',
    desc: 'Documenting a governed data-pipeline PoC: architecture, canonical data models, data-quality gates, and known limitations. Sanitised from a data-platform internship.',
  },
  {
    title: 'CityFlow API — Integration Guide',
    to: '/cityflow/integration-guide',
    desc: 'An SDK-style onboarding guide for a Spring Boot + Kafka backend: authentication, first request, error handling, and asynchronous event-driven behaviour.',
  },
  {
    title: 'Thesis Pipeline — Reproducibility',
    to: '/thesis-pipeline/reproducibility',
    desc: 'Reproducibility documentation for an ML research pipeline: data flow, environment exports, leakage-prevention checks, and run-script order.',
  },
];

export default function Home() {
  return (
    <Layout
      title="Documentation Portfolio"
      description="Developer documentation for backend, data-platform, and ML systems">
      <main style={{maxWidth: 920, margin: '0 auto', padding: '3rem 1.25rem'}}>
        <Heading as="h1" style={{fontSize: '2.4rem', marginBottom: '0.5rem'}}>
          Xinmei Ma — Documentation Portfolio
        </Heading>
        <p style={{fontSize: '1.1rem', color: 'var(--ifm-color-emphasis-700)', maxWidth: 680}}>
          I write developer-facing documentation for complex backend, data-platform, and ML
          systems — architecture docs, data-model specifications, API integration guides, and
          reproducibility workflows, in a docs-as-code workflow. Below are three worked samples.
        </p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2rem'}}>
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={{
                display: 'block', padding: '1.25rem', borderRadius: 10,
                border: '1px solid var(--ifm-color-emphasis-300)',
                textDecoration: 'none', color: 'inherit', background: 'var(--ifm-background-surface-color)',
              }}>
              <Heading as="h3" style={{marginBottom: '0.4rem'}}>{c.title}</Heading>
              <p style={{margin: 0, fontSize: '0.92rem', color: 'var(--ifm-color-emphasis-700)'}}>{c.desc}</p>
            </Link>
          ))}
        </div>
        <p style={{marginTop: '2.5rem'}}>
          <Link className="button button--primary button--lg" to="/intro">Start reading →</Link>
        </p>
      </main>
    </Layout>
  );
}
