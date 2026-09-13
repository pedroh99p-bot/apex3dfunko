export const analyticsConfig = Object.freeze({
  gtmContainerId: 'GTM-PLACEHOLDER',
  ga4MeasurementId: 'G-PLACEHOLDER',
  googleAdsId: 'AW-PLACEHOLDER',
  metaPixelId: 'META-PLACEHOLDER',
});

export const hasAnalyticsConsent = () => localStorage.getItem('apex:consent:v1') === 'accepted';
export const isTrackingConfigured = () => Object.values(analyticsConfig).every(id => id && !id.includes('PLACEHOLDER'));
