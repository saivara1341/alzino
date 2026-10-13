export function isRefurbishedProduct(item) {
  const category = String(item?.category || '').trim().toLowerCase();
  const name = String(item?.name || '').trim().toLowerCase();
  return item?.type === 'refurbished' || /^used mobiles?$/.test(category) ||
    name.startsWith('used ') || name.includes('refurbished') || name.includes('pre-owned');
}

export function isSmartphoneProduct(item) {
  const category = String(item?.category || '').trim().toLowerCase();
  return (item?.department === 'mobiles' || category === 'new mobiles') &&
    !isRefurbishedProduct(item) && category !== 'mobile accessories';
}

export function firstPositiveAmount(...values) {
  const amount = values.map(Number).find(value => Number.isFinite(value) && value > 0);
  return amount ?? 0;
}
