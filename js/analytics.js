import { hasAnalyticsConsent, isTrackingConfigured } from '../config/analytics.js';

const eventLog = [];
const allowedEvents = new Set(['view_product', 'select_product', 'select_size', 'upload_reference', 'customize_outfit', 'add_pet', 'add_accessory', 'add_box', 'select_delivery', 'review_order', 'whatsapp_click', 'promo_view', 'promo_claim', 'begin_checkout', 'purchase']);

export function track(name, parameters = {}) {
  if (!allowedEvents.has(name)) return;
  const clean = Object.fromEntries(Object.entries(parameters).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value)));
  eventLog.push(Object.freeze({ name, parameters: clean }));
  if (!isTrackingConfigured() || !hasAnalyticsConsent()) return;
  window.gtag?.('event', name, clean);
  window.fbq?.('trackCustom', name, clean);
}

export const inspectAnalytics = () => eventLog.map(event => ({ ...event, parameters: { ...event.parameters } }));

if (typeof window !== 'undefined') window.apexAnalytics = Object.freeze({ inspect: inspectAnalytics, configured: isTrackingConfigured });
