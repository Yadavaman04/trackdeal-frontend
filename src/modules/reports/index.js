import endpoints from './api/endpoints';
import * as queries from './queries';

export {
  endpoints as reportsApi,
  queries as reportsQueries
};

export default {
  api: endpoints,
  queries
};
