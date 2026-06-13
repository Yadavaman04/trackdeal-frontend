import endpoints from './api/endpoints';
import * as queries from './queries';

export {
  endpoints as leadsApi,
  queries as leadsQueries
};

export default {
  api: endpoints,
  queries
};
