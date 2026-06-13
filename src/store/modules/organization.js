function getStoredJson(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default {
  namespaced: true,
  state: () => {
    const tenantId = localStorage.getItem('tenant_id') || null;
    const featuresFlags = getStoredJson('featuresFlags', {});
    const branding = getStoredJson('branding', {
      primaryHsl: '220 85% 45%', // Default Deep Indigo
      secondaryHsl: '210 25% 35%', // Default Slate
      logoUrl: '',
      logoDarkUrl: ''
    });

    const organizationType = localStorage.getItem('org_type') || 'AGENCY';
 
    // Inject HSL colors dynamic theme tokens to stylesheet root on boot
    if (typeof window !== 'undefined' && window.document) {
      if (branding?.primaryHsl) {
        document.documentElement.style.setProperty('--primary', branding.primaryHsl);
      }
      if (branding?.secondaryHsl) {
        document.documentElement.style.setProperty('--secondary', branding.secondaryHsl);
      }
    }
 
    return {
      tenantId,
      organizationType,
      featuresFlags,
      branding
    };
  },
  mutations: {
    SET_ORGANIZATION(state, { tenantId, organizationType, branding, featuresFlags }) {
      state.tenantId = tenantId;
      state.organizationType = organizationType || 'AGENCY';
      state.featuresFlags = featuresFlags || {};
      state.branding = { ...state.branding, ...branding };
      
      if (tenantId) {
        localStorage.setItem('tenant_id', tenantId);
      }
      localStorage.setItem('org_type', state.organizationType);
      localStorage.setItem('featuresFlags', JSON.stringify(state.featuresFlags));
      localStorage.setItem('branding', JSON.stringify(state.branding));
      
      // Inject HSL colors dynamic theme tokens to stylesheet root
      if (branding?.primaryHsl) {
        document.documentElement.style.setProperty('--primary', branding.primaryHsl);
      }
      if (branding?.secondaryHsl) {
        document.documentElement.style.setProperty('--secondary', branding.secondaryHsl);
      }
    },
    CLEAR_ORGANIZATION(state) {
      state.tenantId = null;
      state.organizationType = 'AGENCY';
      state.featuresFlags = {};
      state.branding = {
        primaryHsl: '220 85% 45%',
        secondaryHsl: '210 25% 35%',
        logoUrl: '',
        logoDarkUrl: ''
      };
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('org_type');
      localStorage.removeItem('featuresFlags');
      localStorage.removeItem('branding');
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--secondary');
    }
  },
  getters: {
    isFeatureEnabled: (state) => (featureKey) => {
      // If feature flags metadata is empty, allow all by default for fallback
      if (Object.keys(state.featuresFlags).length === 0) return true;
      return !!state.featuresFlags[featureKey];
    },
    organizationType: (state) => state.organizationType,
    isEnterpriseAgency: (state) => state.organizationType === 'ENTERPRISE_AGENCY',
    isIndividualAgent: (state) => state.organizationType === 'INDIVIDUAL_AGENT',
    isAgency: (state) => state.organizationType === 'AGENCY',
    isBranchEnabled: (state) => state.organizationType === 'ENTERPRISE_AGENCY',
  }
};
