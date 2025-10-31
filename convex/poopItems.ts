import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 獲取用戶道具庫存
export const getUserInventory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const inventory = await ctx.db
      .query("inventories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!inventory) {
      // 創建空庫存
      return {
        userId: args.userId,
        items: [],
        totalPoops: 0,
        lastUpdated: Date.now(),
      };
    }
    
    console.log(`✅ Fetched inventory for user ${args.userId}: ${inventory.items.length} items`);
    return inventory;
  },
});

// 添加道具到庫存
export const addItemToInventory = mutation({
  args: {
    userId: v.string(),
    item: v.object({
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
  },
  handler: async (ctx, args) => {
    const existingInventory = await ctx.db
      .query("inventories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingInventory) {
      // 更新現有庫存
      const updatedItems = [...existingInventory.items, args.item];
      await ctx.db.patch(existingInventory._id, {
        items: updatedItems,
        totalPoops: existingInventory.totalPoops + 1,
        lastUpdated: Date.now(),
      });
      console.log(`✅ Added item ${args.item.name} to user ${args.userId}'s inventory`);
      return existingInventory._id;
    } else {
      // 創建新庫存
      const inventoryId = await ctx.db.insert("inventories", {
        userId: args.userId,
        items: [args.item],
        totalPoops: 1,
        lastUpdated: Date.now(),
      });
      console.log(`✅ Created new inventory for user ${args.userId} with item ${args.item.name}`);
      return inventoryId;
    }
  },
});

// 使用道具（從庫存中移除）
export const useItem = mutation({
  args: {
    userId: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const inventory = await ctx.db
      .query("inventories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const itemIndex = inventory.items.findIndex(item => item.id === args.itemId);
    if (itemIndex === -1) {
      throw new Error("Item not found in inventory");
    }

    const item = inventory.items[itemIndex];
    const updatedItems = inventory.items.filter(item => item.id !== args.itemId);

    await ctx.db.patch(inventory._id, {
      items: updatedItems,
      lastUpdated: Date.now(),
    });

    console.log(`✅ Used item ${item.name} from user ${args.userId}'s inventory`);
    return item;
  },
});

// 創建攻擊記錄
export const createAttack = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const attackId = await ctx.db.insert("poopAttacks", {
      ...args,
      viewed: false,
    });
    
    console.log(`✅ Created attack from ${args.fromUserEmail} to ${args.toUserEmail} using ${args.itemUsed.name}`);
    return attackId;
  },
});

// 獲取用戶收到的攻擊
export const getUserAttacks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const attacks = await ctx.db
      .query("poopAttacks")
      .withIndex("by_target_user", (q) => q.eq("toUserId", args.userId))
      .order("desc")
      .take(50); // 限制最近 50 個攻擊
    
    console.log(`✅ Fetched ${attacks.length} attacks for user ${args.userId}`);
    return attacks;
  },
});

// 獲取未查看的攻擊
export const getUnviewedAttacks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const attacks = await ctx.db
      .query("poopAttacks")
      .withIndex("by_target_user_and_viewed", (q) => 
        q.eq("toUserId", args.userId).eq("viewed", false)
      )
      .order("desc")
      .collect();
    
    console.log(`✅ Fetched ${attacks.length} unviewed attacks for user ${args.userId}`);
    return attacks;
  },
});

// 標記攻擊為已查看
export const markAttackAsViewed = mutation({
  args: {
    attackId: v.id("poopAttacks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attackId, { viewed: true });
    console.log(`✅ Marked attack ${args.attackId} as viewed`);
    return args.attackId;
  },
});

// 清理舊攻擊（30天前的）
export const cleanupOldAttacks = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const oldAttacks = await ctx.db
      .query("poopAttacks")
      .withIndex("by_target_user", (q) => q.eq("toUserId", args.userId))
      .filter((q) => q.lt(q.field("timestamp"), thirtyDaysAgo))
      .collect();

    for (const attack of oldAttacks) {
      await ctx.db.delete(attack._id);
    }

    console.log(`✅ Cleaned up ${oldAttacks.length} old attacks for user ${args.userId}`);
    return oldAttacks.length;
  },
});