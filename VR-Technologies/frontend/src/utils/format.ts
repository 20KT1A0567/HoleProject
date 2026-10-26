export const formatPrice = (n: number) => '₹' + n.toLocaleString('en-IN')

export const formatDiscount = (price: number, mrp: number) =>
  Math.round((1 - price / mrp) * 100) + '%'
