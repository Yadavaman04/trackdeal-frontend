import endpoints from './api/endpoints';
import * as queries from './queries';

export {
  endpoints as dealsApi,
  queries as dealsQueries
};

export default {
  api: endpoints,
  queries
};
