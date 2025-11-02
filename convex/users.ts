import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 獲取或創建用戶
export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 檢查用戶是否已存在
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // 更新最後登入時間
      await ctx.db.patch(existingUser._id, {
        lastLoginAt: Date.now(),
        // 如果 Google 資料有更新，也同步更新
        name: args.name || existingUser.name,
        picture: args.picture || existingUser.picture,
      });
      return existingUser;
    }

    // 創建新用戶
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      displayName: args.name, // 初始顯示名稱使用 Google 名稱
      picture: args.picture,
      hasChangedName: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// 獲取用戶資料
export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// 更新用戶顯示名稱
export const updateDisplayName = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("用戶不存在");
    }

    if (user.hasChangedName) {
      throw new Error("您已經使用過免費改名機會");
    }

    // 驗證顯示名稱
    const trimmedName = args.displayName.trim();
    if (!trimmedName) {
      throw new Error("顯示名稱不能為空");
    }

    if (trimmedName.length > 20) {
      throw new Error("顯示名稱不能超過 20 個字符");
    }

    // 檢查是否包含不當內容（簡單過濾）
    const inappropriateWords = ['admin', 'system', 'null', 'undefined', 'test'];
    if (inappropriateWords.some(word => trimmedName.toLowerCase().includes(word))) {
      throw new Error("顯示名稱包含不當內容");
    }

    // 更新顯示名稱並標記已使用改名機會
    await ctx.db.patch(user._id, {
      displayName: trimmedName,
      hasChangedName: true,
    });

    return await ctx.db.get(user._id);
  },
});

// 獲取用戶的顯示名稱
export const getUserDisplayName = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return args.email; // 如果找不到用戶，返回 email
    }

    return user.displayName || user.name || args.email;
  },
});

// 批量獲取用戶顯示名稱
export const getBatchUserDisplayNames = query({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.emails.map(async (email) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();
        
        return {
          email,
          displayName: user?.displayName || user?.name || email,
          picture: user?.picture,
        };
      })
    );

    return users.reduce((acc, user) => {
      acc[user.email] = {
        displayName: user.displayName,
        picture: user.picture,
      };
      return acc;
    }, {} as Record<string, { displayName: string; picture?: string }>);
  },
});

// 檢查用戶是否可以改名
export const canChangeDisplayName = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return !user?.hasChangedName;
  },
});