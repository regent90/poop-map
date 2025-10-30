import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 添加好友
export const addFriend = mutation({
  args: {
    userId: v.string(),
    friendEmail: v.string(),
    friendName: v.string(),
    friendPicture: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    addedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // 檢查是否已經是好友
    const existingFriend = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("friendEmail"), args.friendEmail))
      .first();

    if (existingFriend) {
      // 更新現有好友狀態
      await ctx.db.patch(existingFriend._id, {
        status: args.status,
        addedAt: args.addedAt,
      });
      console.log("✅ Friend updated in Convex:", existingFriend._id);
      return existingFriend._id;
    } else {
      // 創建新好友記錄
      const friendId = await ctx.db.insert("friends", args);
      console.log("✅ Friend added to Convex:", friendId);
      return friendId;
    }
  },
});

// 獲取用戶的好友列表
export const getUserFriends = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", args.userId).eq("status", "accepted")
      )
      .collect();
    
    console.log(`✅ Fetched ${friends.length} friends for user ${args.userId} from Convex`);
    return friends;
  },
});

// 解除好友
export const removeFriend = mutation({
  args: {
    userId: v.string(),
    friendEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const friend = await ctx.db
      .query("friends")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("friendEmail"), args.friendEmail))
      .first();

    if (friend) {
      await ctx.db.delete(friend._id);
      console.log(`✅ Friend ${args.friendEmail} removed from ${args.userId}'s friend list in Convex`);
    }
    
    return friend?._id;
  },
});

// 發送好友請求
export const sendFriendRequest = mutation({
  args: {
    fromUserId: v.string(),
    fromUserName: v.string(),
    fromUserEmail: v.string(),
    fromUserPicture: v.optional(v.string()),
    toUserEmail: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 檢查是否已經發送過請求
    const existingRequest = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user", (q) => q.eq("toUserEmail", args.toUserEmail))
      .filter((q) => q.eq(q.field("fromUserEmail"), args.fromUserEmail))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      console.log("Friend request already exists");
      return existingRequest._id;
    }

    const requestId = await ctx.db.insert("friendRequests", {
      ...args,
      status: "pending",
    });
    
    console.log("✅ Friend request sent to Convex:", requestId);
    return requestId;
  },
});

// 獲取用戶的好友請求
export const getUserFriendRequests = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("friendRequests")
      .withIndex("by_to_user_and_status", (q) => 
        q.eq("toUserEmail", args.userEmail).eq("status", "pending")
      )
      .order("desc")
      .collect();
    
    console.log(`✅ Fetched ${requests.length} friend requests for user ${args.userEmail} from Convex`);
    return requests;
  },
});

// 更新好友請求狀態
export const updateFriendRequestStatus = mutation({
  args: {
    requestId: v.id("friendRequests"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, { status: args.status });
    console.log(`✅ Friend request ${args.requestId} status updated to ${args.status} in Convex`);
    return args.requestId;
  },
});