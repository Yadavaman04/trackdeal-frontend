import endpoints from './api/endpoints';
import * as queries from './queries';

export {
  endpoints as tasksApi,
  queries as tasksQueries
};

export default {
  api: endpoints,
  queries
};
