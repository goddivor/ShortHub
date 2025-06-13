// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export type TagType = "VF" | "VOSTFR" | "VA" | "VOSTA";
export type ChannelType = "Mix" | "Only";

export interface Channel {
  id: string;
  youtube_url: string;
  username: string;
  subscriber_count: number;
  tag: TagType;
  type: ChannelType;
  domain?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShortsRoll {
  id: string;
  channel_id: string;
  video_url: string;
  validated: boolean;
  created_at: string;
  validated_at?: string | null;
  // Join with channel data
  channel?: Channel;
}

// Input types for forms
export interface CreateChannelInput {
  youtube_url: string;
  username: string;
  subscriber_count: number;
  tag: TagType;
  type: ChannelType;
  domain?: string;
}

export interface CreateShortsRollInput {
  channel_id: string;
  video_url: string;
}

// API Response types
export interface ChannelWithStats extends Channel {
  total_rolls: number;
  validated_rolls: number;
  pending_rolls: number;
}

// Database functions
export class ChannelService {
  static async createChannel(input: CreateChannelInput): Promise<Channel> {
    const { data, error } = await supabase
      .from("channels")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getChannelById(id: string): Promise<Channel | null> {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async getChannelsWithStats(): Promise<ChannelWithStats[]> {
    // Get channels first
    const { data: channels, error: channelsError } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (channelsError) throw channelsError;

    // Get stats for each channel
    const channelsWithStats: ChannelWithStats[] = [];

    for (const channel of channels || []) {
      // Get total rolls count
      const { count: totalCount, error: totalError } = await supabase
        .from("shorts_rolls")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", channel.id);

      if (totalError) throw totalError;

      // Get validated rolls count
      const { count: validatedCount, error: validatedError } = await supabase
        .from("shorts_rolls")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", channel.id)
        .eq("validated", true);

      if (validatedError) throw validatedError;

      // Get pending rolls count
      const { count: pendingCount, error: pendingError } = await supabase
        .from("shorts_rolls")
        .select("*", { count: "exact", head: true })
        .eq("channel_id", channel.id)
        .eq("validated", false);

      if (pendingError) throw pendingError;

      channelsWithStats.push({
        ...channel,
        total_rolls: totalCount || 0,
        validated_rolls: validatedCount || 0,
        pending_rolls: pendingCount || 0,
      });
    }

    return channelsWithStats;
  }

  static async updateChannel(
    id: string,
    updates: Partial<CreateChannelInput>
  ): Promise<Channel> {
    const { data, error } = await supabase
      .from("channels")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteChannel(id: string): Promise<void> {
    const { error } = await supabase.from("channels").delete().eq("id", id);

    if (error) throw error;
  }
}

export class ShortsService {
  static async createShortsRoll(
    input: CreateShortsRollInput
  ): Promise<ShortsRoll> {
    const { data, error } = await supabase
      .from("shorts_rolls")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getShortsRolls(channelId?: string): Promise<ShortsRoll[]> {
    let query = supabase
      .from("shorts_rolls")
      .select(
        `
        *,
        channel:channels(*)
      `
      )
      .order("created_at", { ascending: false });

    if (channelId) {
      query = query.eq("channel_id", channelId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getUnvalidatedShortsForChannel(
    channelId: string
  ): Promise<ShortsRoll[]> {
    const { data, error } = await supabase
      .from("shorts_rolls")
      .select("*")
      .eq("channel_id", channelId)
      .eq("validated", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async validateShortsRoll(id: string): Promise<ShortsRoll> {
    const { data, error } = await supabase
      .from("shorts_rolls")
      .update({ validated: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async isVideoAlreadyRolled(
    channelId: string,
    videoUrl: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("shorts_rolls")
      .select("id")
      .eq("channel_id", channelId)
      .eq("video_url", videoUrl)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  static async getRandomUnvalidatedVideo(
    channelId: string
  ): Promise<string | null> {
    // This is a simplified approach - in a real app, you'd implement
    // YouTube API integration to get random shorts
    const unvalidated = await this.getUnvalidatedShortsForChannel(channelId);

    if (unvalidated.length === 0) {
      // No unvalidated videos, would need to fetch new ones from YouTube API
      return null;
    }

    // Return a random unvalidated video
    const randomIndex = Math.floor(Math.random() * unvalidated.length);
    return unvalidated[randomIndex].video_url;
  }
}

// Utility functions
export const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const getChannelTypeColor = (type: ChannelType): string => {
  return type === "Mix"
    ? "bg-blue-100 text-blue-800"
    : "bg-green-100 text-green-800";
};

export const getTagColor = (tag: TagType): string => {
  const colors = {
    VF: "bg-red-100 text-red-800",
    VOSTFR: "bg-blue-100 text-blue-800",
    VA: "bg-yellow-100 text-yellow-800",
    VOSTA: "bg-purple-100 text-purple-800",
  };
  return colors[tag];
};