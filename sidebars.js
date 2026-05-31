// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  portfolioSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Airflow PoC (Case Study)',
      link: { type: 'doc', id: 'airflow-poc/overview' },
      items: [
        'airflow-poc/architecture',
        'airflow-poc/data-models',
        'airflow-poc/data-quality',
        'airflow-poc/limitations',
      ],
    },
    {
      type: 'category',
      label: 'CityFlow API',
      link: { type: 'doc', id: 'cityflow/integration-guide' },
      items: [
        'cityflow/api-overview',
        'cityflow/local-development',
        'cityflow/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Thesis Pipeline',
      link: { type: 'doc', id: 'thesis-pipeline/reproducibility' },
      items: [
        'thesis-pipeline/data-flow',
        'thesis-pipeline/leakage-prevention',
      ],
    },
  ],
};
export default sidebars;
