//create average
export function safe_average(sum: number, count: number) {
  return count === 0 ? 0 : sum / count;
}

export function compute_display_rating(product: any) {
  const avgStars =
    product.product_user_rating_count === 0
      ? 0
      : product.product_user_rating_sum / product.product_user_rating_count;

  const avgIC =
    product.product_ic_rating_count === 0
      ? 0
      : product.product_ic_rating_sum / product.product_ic_rating_count;

  return {
    avgStars,
    avgIC,
  };
}

export function compute_ranking_score(product: any): number {
  const { avgStars, avgIC } = compute_display_rating(product);

  const icNormalized = (avgIC / 5) * 10;

  return avgStars + icNormalized;
}
