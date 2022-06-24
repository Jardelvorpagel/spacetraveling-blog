import * as prismic from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import sm from '../../sm.json';

export const endpoint: string = sm.apiEndpoint;
export const repositoryName: string = prismic.getRepositoryName(endpoint);

export const getPrismicClient: (config?: any) => prismic.Client = (
  config: any = {}
): prismic.Client => {
  const client: prismic.Client = prismic.createClient(endpoint, { ...config });

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  });

  return client;
};
