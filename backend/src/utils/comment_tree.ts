import Like from "../model/like_model";
import Comment from "../model/comment_model";

export async function comment_tree(comments: any[], current_user_id: string) {
  const lookup: Record<string, any> = {};
  const roots: any[] = [];

  // Map each comment
  for (const comment of comments) {
    const id = String(comment._id);

    lookup[id] = {
      ...comment,
      replies: [],
      like_count: 0,
      liked_by_user: false,
    };
  }

  // Aggregate like counts
  const likeCounts = await Like.aggregate([
    { $match: { comment: { $in: comments.map((c) => c._id) } } },
    { $group: { _id: "$comment", total: { $sum: 1 } } },
  ]);

  likeCounts.forEach((item) => {
    const id = String(item._id);

    if (lookup[id]) {
      lookup[id].like_count = item.total;
    }
  });

  // User-liked detection
  if (current_user_id) {
    const userLikes = await Like.find({
      user: current_user_id,
      comment: { $in: comments.map((c) => c._id) },
    }).lean();

    userLikes.forEach((like) => {
      const id = String(like.comment);
      if (lookup[id]) {
        lookup[id].liked_by_user = true;
      }
    });
  }

  // Build tree
  for (const comment of comments) {
    const id = String(comment._id);
    const parentId = comment.parent_comment
      ? String(comment.parent_comment)
      : null;

    if (parentId && lookup[parentId]) {
      lookup[parentId].replies.push(lookup[id]);
    } else {
      roots.push(lookup[id]);
    }
  }

  return roots;
}

export async function delete_comment_tree(comment_id: string) {
  const comment = await Comment.findById(comment_id).lean();
  if (!comment) return;

  const replies = await Comment.find({ parent_comment: comment_id }).lean();

  for (const reply of replies) {
    await delete_comment_tree(String(reply._id));
  }

  // delete likes for this comment
  await Like.deleteMany({ comment: comment_id });

  // delete comment
  await Comment.findByIdAndDelete(comment_id);
}
