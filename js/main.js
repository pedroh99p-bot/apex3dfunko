import { startConfigurator } from './shell-controller.js';
import { startShellInteractions } from './shell-interactions.js';
import { startCommercialUI } from './commercial-ui.js';
import { startWhatsAppLinks } from './whatsapp.js';
startCommercialUI();
startShellInteractions();
startConfigurator();
startWhatsAppLinks();
