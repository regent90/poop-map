import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 用戶表
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    displayName: v.optional(v.string()), // 用戶自定義顯示名稱
    picture: v.optional(v.string()),
    hasChangedName: v.optional(v.boolean()), // 是否已經使用過免費改名機會
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_email", ["email"]),

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

  // 成就表
  achievements: defineTable({
    userId: v.string(),
    achievementId: v.string(),
    unlockedAt: v.number(),
    progress: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_achievement", ["achievementId"])
    .index("by_user_and_achievement", ["userId", "achievementId"]),

  // 挑戰表
  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("poop_count"),
      v.literal("rating_streak"),
      v.literal("friend_invite"),
      v.literal("attack_count"),
      v.literal("location_variety")
    ),
    target: v.number(),
    duration: v.number(),
    createdBy: v.string(),
    createdByName: v.string(),
    participants: v.array(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")),
    reward: v.object({
      type: v.union(v.literal("achievement"), v.literal("item"), v.literal("points")),
      value: v.union(v.string(), v.number()),
    }),
  })
    .index("by_creator", ["createdBy"])
    .index("by_status", ["status"])
    .index("by_end_time", ["endTime"]),

  // 挑戰參與者進度表
  challengeProgress: defineTable({
    challengeId: v.id("challenges"),
    userId: v.string(),
    progress: v.number(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_user", ["userId"])
    .index("by_challenge_and_user", ["challengeId", "userId"]),

  // 通知表
  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("friend_request"),
      v.literal("attack_received"),
      v.literal("achievement_unlocked"),
      v.literal("challenge_invite"),
      v.literal("leaderboard_update"),
      v.literal("item_received")
    ),
    title: v.string(),
    message: v.string(),
    icon: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    actionUrl: v.optional(v.string()),
    data: v.optional(v.object({
      fromUserId: v.optional(v.string()),
      achievementId: v.optional(v.string()),
      challengeId: v.optional(v.string()),
      itemId: v.optional(v.string()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"])
    .index("by_timestamp", ["timestamp"]),

  // 動態活動表
  feedActivities: defineTable({
    userId: v.string(),
    userEmail: v.string(),
    userName: v.string(),
    userPicture: v.optional(v.string()),
    type: v.union(
      v.literal("poop_recorded"),
      v.literal("achievement_unlocked"),
      v.literal("friend_added"),
      v.literal("attack_sent"),
      v.literal("challenge_completed")
    ),
    timestamp: v.number(),
    data: v.object({
      poopId: v.optional(v.string()),
      achievementId: v.optional(v.string()),
      friendEmail: v.optional(v.string()),
      attackId: v.optional(v.string()),
      challengeId: v.optional(v.string()),
      location: v.optional(v.string()),
      rating: v.optional(v.number()),
      achievementName: v.optional(v.string()),
      achievementIcon: v.optional(v.string()),
      friendName: v.optional(v.string()),
      targetEmail: v.optional(v.string()),
      targetName: v.optional(v.string()),
      itemName: v.optional(v.string()),
    }),
    privacy: v.union(v.literal("private"), v.literal("friends"), v.literal("public")),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_privacy", ["privacy"]),
});