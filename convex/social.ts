import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 成就相關函數
export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    console.log(`✅ Fetched ${achievements.length} achievements for user ${args.userId}`);
    return achievements;
  },
});

export const unlockAchievement = mutation({
  args: {
    userId: v.string(),
    achievementId: v.string(),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 檢查是否已經解鎖
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_user_and_achievement", (q) => 
        q.eq("userId", args.userId).eq("achievementId", args.achievementId)
      )
      .first();

    if (existing) {
      console.log(`Achievement ${args.achievementId} already unlocked for user ${args.userId}`);
      return existing._id;
    }

    const achievementId = await ctx.db.insert("achievements", {
      userId: args.userId,
      achievementId: args.achievementId,
      unlockedAt: Date.now(),
      progress: args.progress || 100,
    });

    console.log(`✅ Unlocked achievement ${args.achievementId} for user ${args.userId}`);
    return achievementId;
  },
});

// 挑戰相關函數
export const getChallenges = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let challenges;
    
    if (args.userId) {
      // 獲取用戶創建的挑戰
      const createdChallenges = await ctx.db
        .query("challenges")
        .filter((q) => q.eq(q.field("createdBy"), args.userId))
        .order("desc")
        .take(25);
      
      // 獲取所有挑戰，然後在應用層過濾參與者
      const allChallenges = await ctx.db
        .query("challenges")
        .order("desc")
        .take(50);
      
      // 過濾出用戶參與的挑戰
      const participatedChallenges = allChallenges.filter(challenge => 
        args.userId && challenge.participants.includes(args.userId)
      );
      
      // 合併並去重
      const challengeMap = new Map();
      [...createdChallenges, ...participatedChallenges].forEach(challenge => {
        challengeMap.set(challenge._id, challenge);
      });
      
      challenges = Array.from(challengeMap.values());
    } else {
      // 獲取所有活躍挑戰
      challenges = await ctx.db
        .query("challenges")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(20);
    }
    
    console.log(`✅ Fetched ${challenges.length} challenges`);
    return challenges;
  },
});

export const createChallenge = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const challengeId = await ctx.db.insert("challenges", {
      ...args,
      startTime: Date.now(),
      endTime: Date.now() + args.duration,
      status: "active",
      reward: {
        type: "points",
        value: args.target * 10,
      },
    });

    // 為每個參與者創建進度記錄
    for (const participantId of args.participants) {
      await ctx.db.insert("challengeProgress", {
        challengeId,
        userId: participantId,
        progress: 0,
        completed: false,
      });
    }

    console.log(`✅ Created challenge ${challengeId} with ${args.participants.length} participants`);
    return challengeId;
  },
});

export const updateChallengeProgress = mutation({
  args: {
    challengeId: v.id("challenges"),
    userId: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const progressRecord = await ctx.db
      .query("challengeProgress")
      .withIndex("by_challenge_and_user", (q) => 
        q.eq("challengeId", args.challengeId).eq("userId", args.userId)
      )
      .first();

    if (!progressRecord) {
      console.log(`No progress record found for challenge ${args.challengeId} and user ${args.userId}`);
      return null;
    }

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      console.log(`Challenge ${args.challengeId} not found`);
      return null;
    }

    const completed = args.progress >= challenge.target;
    
    await ctx.db.patch(progressRecord._id, {
      progress: args.progress,
      completed,
      completedAt: completed ? Date.now() : undefined,
    });

    console.log(`✅ Updated challenge progress for user ${args.userId}: ${args.progress}/${challenge.target}`);
    return progressRecord._id;
  },
});

// 通知相關函數
export const getUserNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
    
    console.log(`✅ Fetched ${notifications.length} notifications for user ${args.userId}`);
    return notifications;
  },
});

export const createNotification = mutation({
  args: {
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
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    actionUrl: v.optional(v.string()),
    data: v.optional(v.object({
      fromUserId: v.optional(v.string()),
      achievementId: v.optional(v.string()),
      challengeId: v.optional(v.string()),
      itemId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      timestamp: Date.now(),
      read: false,
    });

    console.log(`✅ Created notification ${notificationId} for user ${args.userId}`);
    return notificationId;
  },
});

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
    console.log(`✅ Marked notification ${args.notificationId} as read`);
    return args.notificationId;
  },
});

// 動態活動相關函數
export const getFeedActivities = query({
  args: { 
    userId: v.string(),
    friendEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let activities;
    
    if (args.friendEmails && args.friendEmails.length > 0) {
      // 獲取用戶和朋友的活動
      const userEmails = [args.userId, ...args.friendEmails];
      activities = await ctx.db
        .query("feedActivities")
        .filter((q) => {
          // 簡化查詢 - 實際應該使用 IN 操作
          return q.or(
            q.eq(q.field("userEmail"), args.userId),
            q.eq(q.field("privacy"), "public")
          );
        })
        .order("desc")
        .take(50);
    } else {
      // 只獲取用戶自己的活動
      activities = await ctx.db
        .query("feedActivities")
        .filter((q) => q.eq(q.field("userEmail"), args.userId))
        .order("desc")
        .take(50);
    }
    
    console.log(`✅ Fetched ${activities.length} feed activities`);
    return activities;
  },
});

export const createFeedActivity = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("feedActivities", {
      ...args,
      timestamp: Date.now(),
    });

    console.log(`✅ Created feed activity ${activityId} for user ${args.userId}`);
    return activityId;
  },
});

// 排行榜相關函數
export const getLeaderboard = query({
  args: { 
    period: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("allTime")),
    friendEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 獲取所有便便記錄來計算排行榜
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    let timeFilter;
    switch (args.period) {
      case "weekly":
        timeFilter = weekAgo;
        break;
      case "monthly":
        timeFilter = monthAgo;
        break;
      default:
        timeFilter = 0;
    }

    // 獲取指定時間段的便便記錄
    const poops = await ctx.db
      .query("poops")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", timeFilter))
      .collect();

    // 按用戶分組統計
    const userStats: Record<string, {
      userId: string;
      totalPoops: number;
      averageRating: number;
      lastPoopTime: number;
    }> = {};

    poops.forEach(poop => {
      if (!userStats[poop.userId]) {
        userStats[poop.userId] = {
          userId: poop.userId,
          totalPoops: 0,
          averageRating: 0,
          lastPoopTime: 0,
        };
      }

      userStats[poop.userId].totalPoops++;
      userStats[poop.userId].averageRating += poop.rating || 0;
      userStats[poop.userId].lastPoopTime = Math.max(
        userStats[poop.userId].lastPoopTime,
        poop.timestamp
      );
    });

    // 計算平均評分並排序
    const leaderboard = Object.values(userStats)
      .map(stats => ({
        ...stats,
        averageRating: stats.totalPoops > 0 ? stats.averageRating / stats.totalPoops : 0,
      }))
      .sort((a, b) => b.totalPoops - a.totalPoops)
      .slice(0, 50);

    console.log(`✅ Generated ${args.period} leaderboard with ${leaderboard.length} entries`);
    return leaderboard;
  },
});