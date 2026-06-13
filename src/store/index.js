import { createStore } from 'vuex';
import auth from './modules/auth';
import permissions from './modules/permissions';
import organization from './modules/organization';
import ui from './modules/ui';
import notifications from './modules/notifications';
import dashboard from './modules/dashboard';

export default createStore({
  modules: {
    auth,
    permissions,
    organization,
    ui,
    notifications,
    dashboard
  }
});
