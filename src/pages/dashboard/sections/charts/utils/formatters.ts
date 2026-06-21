export function formatCount(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAttackTypeLabel(attackType: string): string {
  const normalizedLabel = attackType.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

  if (normalizedLabel.length === 0) {
    return 'Type inconnu';
  }

  return normalizedLabel.charAt(0).toLocaleUpperCase('fr-FR') + normalizedLabel.slice(1);
}
