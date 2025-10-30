import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 創建新便便
export const createPoop = mutation({
  args: {
    userId: v.string(),
    lat: v.number(),
    lng: v.number(),
    timestamp: v.number(),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    photo: v.optional(v.string()),
    privacy: v.union(v.literal("private"), v.literal("friends"), v.literal("public")),
    placeName: v.optional(v.string()),
    customLocation: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const poopId = await ctx.db.insert("poops", args);
    console.log("✅ Poop created in Convex:", poopId);
    return poopId;
  },
});

// 獲取用戶的便便
export const getUserPoops = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const poops = await ctx.db
      .query("poops")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    console.log(`✅ Fetched ${poops.length} poops for user ${args.userId} from Convex`);
    return poops;
  },
});

// 獲取好友的便便
export const getFriendsPoops = query({
  args: { friendEmails: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.friendEmails.length === 0) return [];

    const allPoops = await ctx.db.query("poops").collect();
    const friendsPoops = allPoops.filter(poop => 
      args.friendEmails.includes(poop.userId) && 
      (poop.privacy === "friends" || poop.privacy === "public")
    );

    // 按時間戳排序
    friendsPoops.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`✅ Fetched ${friendsPoops.length} friends poops from Convex`);
    return friendsPoops;
  },
});

// 獲取公開便便
export const getPublicPoops = query({
  args: {},
  handler: async (ctx) => {
    const poops = await ctx.db
      .query("poops")
      .withIndex("by_privacy", (q) => q.eq("privacy", "public"))
      .order("desc")
      .take(50);
    
    console.log(`✅ Fetched ${poops.length} public poops from Convex`);
    return poops;
  },
});

// 更新便便
export const updatePoop = mutation({
  args: {
    id: v.id("poops"),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    privacy: v.optional(v.union(v.literal("private"), v.literal("friends"), v.literal("public"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    console.log("✅ Poop updated in Convex:", id);
    return id;
  },
});

// 刪除便便
export const deletePoop = mutation({
  args: { id: v.id("poops") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    console.log("✅ Poop deleted from Convex:", args.id);
    return args.id;
  },
});