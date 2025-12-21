import Like from "../model/like_model";

export async function get_comment_like_count(comment_id: string){
    return Like.countDocuments({comment:comment_id})
}

export async function get_product_like_count(product_id: string){
    return Like.countDocuments({product: product_id});
}

//display notification
export async function user_liked_comment(user_id: string, comment_id: string){
    return Like.exists({user: user_id, comment: comment_id})
}

export async function user_liked_product(user_id: string, product_id: string){
    return Like.exists({user:user_id, product:product_id})
}