

//construct a Hierarchy Alggorithm for nested comments (what the fuck is this)
export function comment_tree(comment_list: any[]){
    //1 - Create a map so that we can find each comment by its _id
    //eg: lookup ["1"] -> comment 1 object
    const lookup: Record<string, any> = {};
    
    //2 - array hold top level comments
    const tree_roots: any[] = [];

    //3 - Add each comment to the lookup map, prepare empty replies array for each comments.
    for (const comment of comment_list){
        lookup[comment._id] = {
            ...comment,
            replies:[] // each comment can have replies
        };
    }
    
    //Connect each comment to its parent (if it has 1)
    for (const comment of comment_list){
        // null or some id
        const parent_id = comment.parent_comment;
        if(parent_id){
            //this comment is a reply --> attach to parent's "replies" array
            const parent = lookup[parent_id];
            if(parent) {
                parent.replies.push(lookup[comment._id]);
            }
        } else {
            //no parent --> this is a ROOT comment
            tree_roots.push(lookup[comment._id])
        }
    }
    //return the tree
    return tree_roots

}

