"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safe_average = safe_average;
exports.compute_display_rating = compute_display_rating;
exports.compute_ranking_score = compute_ranking_score;
//create average
function safe_average(sum, count) {
    return count === 0 ? 0 : sum / count;
}
function compute_display_rating(product) {
    const avgStars = product.product_user_rating_count === 0
        ? 0
        : product.product_user_rating_sum / product.product_user_rating_count;
    const avgIC = product.product_ic_rating_count === 0
        ? 0
        : product.product_ic_rating_sum / product.product_ic_rating_count;
    return {
        avgStars,
        avgIC,
    };
}
function compute_ranking_score(product) {
    const { avgStars, avgIC } = compute_display_rating(product);
    return avgStars + avgIC;
}
