import endpoints from './api/endpoints';
import * as queries from './queries';

export {
  endpoints as commissionsApi,
  queries as commissionsQueries
};

export default {
  api: endpoints,
  queries
};
