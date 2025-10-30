import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 添加留言
export const addComment = mutation({
  args: {
    poopId: v.id("poops"),
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    content: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", args);
    console.log("✅ Comment added to Convex:", commentId);
    return commentId;
  },
});

// 獲取便便的留言
export const getComments = query({
  args: { poopId: v.id("poops") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_poop", (q) => q.eq("poopId", args.poopId))
      .order("asc")
      .collect();
    
    console.log(`✅ Fetched ${comments.length} comments for poop ${args.poopId} from Convex`);
    return comments;
  },
});

// 刪除留言
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.commentId);
    console.log("✅ Comment deleted from Convex:", args.commentId);
    return args.commentId;
  },
});

// 添加按讚
export const addLike = mutation({
  args: {
    poopId: v.id("poops"),
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 檢查是否已經按過讚
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_poop", (q) => 
        q.eq("userId", args.userId).eq("poopId", args.poopId)
      )
      .first();

    if (existingLike) {
      throw new Error("ALREADY_LIKED");
    }

    const likeId = await ctx.db.insert("likes", args);
    console.log("✅ Like added to Convex:", likeId);
    return likeId;
  },
});

// 獲取便便的按讚
export const getLikes = query({
  args: { poopId: v.id("poops") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_poop", (q) => q.eq("poopId", args.poopId))
      .order("desc")
      .collect();
    
    console.log(`✅ Fetched ${likes.length} likes for poop ${args.poopId} from Convex`);
    return likes;
  },
});

// 移除按讚
export const removeLike = mutation({
  args: {
    poopId: v.id("poops"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_poop", (q) => 
        q.eq("userId", args.userId).eq("poopId", args.poopId)
      )
      .first();

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      console.log("✅ Like removed from Convex:", { poopId: args.poopId, userId: args.userId });
      return existingLike._id;
    }
    
    return null;
  },
});

// 獲取便便的互動數據（留言 + 按讚）
export const getPoopInteractions = query({
  args: { poopId: v.id("poops") },
  handler: async (ctx, args) => {
    const [comments, likes] = await Promise.all([
      ctx.db
        .query("comments")
        .withIndex("by_poop", (q) => q.eq("poopId", args.poopId))
        .order("asc")
        .collect(),
      ctx.db
        .query("likes")
        .withIndex("by_poop", (q) => q.eq("poopId", args.poopId))
        .order("desc")
        .collect(),
    ]);
    
    console.log(`✅ Fetched interactions for poop ${args.poopId}: ${comments.length} comments, ${likes.length} likes`);
    return { comments, likes };
  },
});