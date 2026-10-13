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
  const amount = values
    .map(value => typeof value === 'string' ? Number(value.replace(/[₹,\s]/g, '')) : Number(value))
    .find(value => Number.isFinite(value) && value > 0);
  return amount ?? 0;
}

// Inventory, published catalog rows, imported products, and older app versions
// have used different names for the same customer selling price. Keep one
// resolver so cards, product details, variants, and carts agree.
export function getProductSellingPrice(product, fallback = 0) {
  return firstPositiveAmount(
    product?.sellPrice,
    product?.sellingPrice,
    product?.sell_price,
    product?.selling_price,
    product?.targetSellPrice,
    product?.target_sell_price,
    product?.expectedSellingPrice,
    product?.expected_selling_price,
    product?.price,
    fallback
  );
}
