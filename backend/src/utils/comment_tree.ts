import Comment from "../model/comment_model";

export async function comment_tree(comments: any[]) {
  const lookup: Record<string, any> = {};
  const roots: any[] = [];

  // Map each comment
  for (const comment of comments) {
    const id = String(comment._id);

    lookup[id] = {
      ...comment,
      replies: []
    };
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

  // find replies
  const replies = await Comment.find({ parent_comment: comment_id }).lean();

  // delete children first
  for (const reply of replies) {
    await delete_comment_tree(String(reply._id));
  }

  // delete main comment
  await Comment.findByIdAndDelete(comment_id);
}
