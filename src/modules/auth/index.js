import authRoutes from './router/routes';
import authApi from './api/endpoints';
import * as authQueries from './queries';
import * as authSchemas from './schemas/validation';

export {
  authRoutes,
  authApi,
  authQueries,
  authSchemas
};

export default {
  routes: authRoutes,
  api: authApi,
  queries: authQueries,
  schemas: authSchemas
};
