import { startConfigurator } from './ui.js';
try {
  startConfigurator();
  document.documentElement.dataset.apexReady = 'true';
} catch {
  const message = document.createElement('p');
  message.className = 'error-panel';
  message.textContent = 'Não foi possível iniciar a personalização. Recarregue a página para tentar novamente.';
  document.querySelector('#personalize').prepend(message);
}
