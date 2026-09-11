import { mountTemplate } from './template.js';
import { startConfigurator } from './ui.js';

try {
  await mountTemplate();
  startConfigurator();
  document.documentElement.dataset.apexReady = 'true';
} catch (error) {
  const message = document.getElementById('apex-loading') || document.createElement('p');
  message.textContent = `A prévia local não iniciou: ${error.message}`;
  document.body.prepend(message);
}
