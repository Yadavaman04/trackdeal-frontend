import endpoints from './api/endpoints';
import * as queries from './queries';

export {
  endpoints as propertiesApi,
  queries as propertiesQueries
};

export default {
  api: endpoints,
  queries
};
