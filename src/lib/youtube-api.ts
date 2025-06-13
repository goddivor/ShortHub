// src/lib/youtube-api.ts
interface ChannelData {
  username: string;
  subscriber_count: number;
}

interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      customUrl?: string;
    };
    statistics: {
      subscriberCount: string;
    };
  }>;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      channelId: string;
      title: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

const parseDuration = (duration: string): number => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || "0");
  const minutes = parseInt(matches[2] || "0");
  const seconds = parseInt(matches[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
};

// Get channel ID from URL (for shorts fetching)
const getChannelIdFromUrl = async (channelUrl: string): Promise<string> => {
  const identifier = extractChannelIdentifier(channelUrl);

  if (!identifier) {
    throw new Error("Invalid YouTube URL format");
  }

  if (identifier.type === "id") {
    return identifier.value;
  } else {
    // Need to search for the channel to get the ID
    const channelId = await searchChannelByName(identifier.value);
    if (!channelId) {
      throw new Error("Channel not found");
    }
    return channelId;
  }
};

// Extract channel ID or username from YouTube URL
const extractChannelIdentifier = (
  url: string
): { type: "id" | "username" | "handle"; value: string } | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Handle different YouTube URL formats
    if (pathname.includes("/channel/")) {
      // https://www.youtube.com/channel/UC...
      const channelId = pathname.split("/channel/")[1].split("/")[0];
      return { type: "id", value: channelId };
    } else if (pathname.includes("/c/")) {
      // https://www.youtube.com/c/channelname
      const customUrl = pathname.split("/c/")[1].split("/")[0];
      return { type: "username", value: customUrl };
    } else if (pathname.includes("/user/")) {
      // https://www.youtube.com/user/username
      const username = pathname.split("/user/")[1].split("/")[0];
      return { type: "username", value: username };
    } else if (pathname.startsWith("/@")) {
      // https://www.youtube.com/@channelhandle
      const handle = pathname.substring(2).split("/")[0];
      return { type: "handle", value: handle };
    } else if (pathname === "/" && urlObj.searchParams.get("channel")) {
      // https://www.youtube.com/?channel=UC...
      const channelId = urlObj.searchParams.get("channel")!;
      return { type: "id", value: channelId };
    }

    return null;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return null;
  }
};

// Search for channel by custom URL or handle
const searchChannelByName = async (query: string): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
        query
      )}&maxResults=1&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API search error: ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }

    return null;
  } catch (error) {
    console.error("Error searching for channel:", error);
    throw error;
  }
};

// Get channel details by ID
const getChannelById = async (channelId: string): Promise<ChannelData> => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data: YouTubeChannelResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }

    const channel = data.items[0];

    // Extract username from customUrl or use channel title
    let username = channel.snippet.customUrl || channel.snippet.title;

    // Add @ prefix if not present and it looks like a handle
    if (username && !username.startsWith("@") && channel.snippet.customUrl) {
      username = `@${username}`;
    }

    const subscriberCount = parseInt(channel.statistics.subscriberCount) || 0;

    return {
      username: username || channel.snippet.title,
      subscriber_count: subscriberCount,
    };
  } catch (error) {
    console.error("Error fetching channel details:", error);
    throw error;
  }
};

// Main function to extract channel data from URL
export const extractChannelData = async (url: string): Promise<ChannelData> => {
  if (!url || url.trim().length === 0) {
    throw new Error("URL is required");
  }

  // Clean and validate URL
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith("http")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const identifier = extractChannelIdentifier(cleanUrl);

  if (!identifier) {
    throw new Error("Invalid YouTube URL format");
  }

  let channelId: string;

  try {
    if (identifier.type === "id") {
      // Direct channel ID
      channelId = identifier.value;
    } else {
      // Need to search for the channel
      const foundChannelId = await searchChannelByName(identifier.value);

      if (!foundChannelId) {
        throw new Error("Channel not found");
      }

      channelId = foundChannelId;
    }

    // Get channel details
    return await getChannelById(channelId);
  } catch (error) {
    console.error("Error extracting channel data:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("quotaExceeded")) {
        throw new Error("YouTube API quota exceeded. Please try again later.");
      } else if (error.message.includes("keyInvalid")) {
        throw new Error(
          "YouTube API key is invalid. Please check configuration."
        );
      } else if (error.message.includes("not found")) {
        throw new Error("Channel not found. Please verify the URL is correct.");
      }
    }

    throw new Error(
      "Failed to extract channel data. Please verify the URL and try again."
    );
  }
};

// Get YouTube Shorts from a specific channel
export const getChannelShorts = async (
  channelUrl: string,
  maxResults: number = 50
): Promise<string[]> => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "YouTube API key not configured. Please set VITE_YOUTUBE_API_KEY in your environment variables."
    );
  }

  try {
    // Get channel ID from URL
    const channelId = await getChannelIdFromUrl(channelUrl);

    // Search for videos from this channel
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!searchResponse.ok) {
      if (searchResponse.status === 403) {
        throw new Error("YouTube API quota exceeded or invalid API key");
      }
      throw new Error(`YouTube API search error: ${searchResponse.status}`);
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video IDs
    const videoIds = searchData.items.map((item) => item.id.videoId);

    // Get video details to check duration (Shorts are <= 60 seconds)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(
        ","
      )}&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube API videos error: ${videosResponse.status}`);
    }

    const videosData: YouTubeVideoResponse = await videosResponse.json();

    // Filter for Shorts (videos <= 60 seconds)
    const shortVideoIds: string[] = [];

    videosData.items?.forEach((video) => {
      const durationInSeconds = parseDuration(video.contentDetails.duration);
      if (durationInSeconds > 0 && durationInSeconds <= 60) {
        shortVideoIds.push(video.id);
      }
    });

    // Convert to YouTube Shorts URLs
    const shortsUrls = shortVideoIds.map(
      (videoId) => `https://youtube.com/shorts/${videoId}`
    );

    return shortsUrls;
  } catch (error) {
    console.error("Error fetching channel shorts:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("quotaExceeded")) {
        throw new Error("YouTube API quota exceeded. Please try again later.");
      } else if (
        error.message.includes("keyInvalid") ||
        error.message.includes("API key")
      ) {
        throw new Error(
          "YouTube API key is invalid or not configured. Please check your environment variables."
        );
      } else if (error.message.includes("not found")) {
        throw new Error("Channel not found. Please verify the URL is correct.");
      }
    }

    throw new Error(
      "Failed to fetch channel shorts. Please verify the channel URL and API configuration."
    );
  }
};
