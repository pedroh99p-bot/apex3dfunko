import { mvpRules } from '../config/mvp.js';

export function localDateISO(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function minimumDesiredDate(now = new Date(), rule = mvpRules.date) {
  const date = new Date(now); date.setDate(date.getDate() + rule.minLeadDays);
  return localDateISO(date);
}
export function validateDesiredDate(value, { now = new Date(), rule = mvpRules.date } = {}) {
  if (!value) return rule.required ? { code: 'DATE_REQUIRED', message: 'Informe quando você precisa receber.' } : null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { code: 'DATE_INVALID', message: 'Informe uma data válida.' };
  const [y, m, d] = value.split('-').map(Number), date = new Date(y, m - 1, d);
  if (localDateISO(date) !== value) return { code: 'DATE_INVALID', message: 'Informe uma data que exista no calendário.' };
  if (value < localDateISO(now)) return { code: 'DATE_PAST', message: 'A data desejada não pode estar no passado.' };
  if (value < minimumDesiredDate(now, rule) || rule.excludedWeekdays.includes(date.getDay())) return { code: 'DATE_UNAVAILABLE', message: 'Escolha uma data permitida pelas regras de prazo.' };
  return null;
}
export function displayDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : 'Não informada';
}
