import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 便便表
  poops: defineTable({
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
  })
    .index("by_user", ["userId"])
    .index("by_privacy", ["privacy"])
    .index("by_timestamp", ["timestamp"]),

  // 好友表
  friends: defineTable({
    userId: v.string(),
    friendEmail: v.string(),
    friendName: v.string(),
    friendPicture: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_friend", ["friendEmail"]),

  // 好友請求表
  friendRequests: defineTable({
    fromUserId: v.string(),
    fromUserName: v.string(),
    fromUserEmail: v.string(),
    fromUserPicture: v.optional(v.string()),
    toUserEmail: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    timestamp: v.number(),
  })
    .index("by_to_user", ["toUserEmail"])
    .index("by_to_user_and_status", ["toUserEmail", "status"])
    .index("by_from_user", ["fromUserEmail"]),

  // 留言表
  comments: defineTable({
    poopId: v.id("poops"),
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_poop", ["poopId"])
    .index("by_timestamp", ["timestamp"]),

  // 按讚表
  likes: defineTable({
    poopId: v.id("poops"),
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_poop", ["poopId"])
    .index("by_user_and_poop", ["userId", "poopId"])
    .index("by_timestamp", ["timestamp"]),

  // 道具庫存表
  inventories: defineTable({
    userId: v.string(),
    items: v.array(v.object({
      id: v.string(),
      type: v.union(
        v.literal("poop_bomb"),
        v.literal("golden_poop"),
        v.literal("rainbow_poop"),
        v.literal("stinky_poop")
      ),
      name: v.string(),
      description: v.string(),
      icon: v.string(),
      rarity: v.union(
        v.literal("common"),
        v.literal("rare"),
        v.literal("epic"),
        v.literal("legendary")
      ),
      obtainedAt: v.number(),
    })),
    totalPoops: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"]),

  // 便便攻擊表
  poopAttacks: defineTable({
    fromUserId: v.string(),
    fromUserName: v.string(),
    fromUserEmail: v.string(),
    fromUserPicture: v.optional(v.string()),
    toUserId: v.string(),
    toUserEmail: v.string(),
    itemUsed: v.object({
      id: v.string(),
      type: v.union(
        v.literal("poop_bomb"),
        v.literal("golden_poop"),
        v.literal("rainbow_poop"),
        v.literal("stinky_poop")
      ),
      name: v.string(),
      description: v.string(),
      icon: v.string(),
      rarity: v.union(
        v.literal("common"),
        v.literal("rare"),
        v.literal("epic"),
        v.literal("legendary")
      ),
      obtainedAt: v.number(),
    }),
    message: v.optional(v.string()),
    timestamp: v.number(),
    viewed: v.boolean(),
  })
    .index("by_target_user", ["toUserId"])
    .index("by_target_user_and_viewed", ["toUserId", "viewed"])
    .index("by_timestamp", ["timestamp"]),
});