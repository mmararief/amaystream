import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Channel manager untuk broadcast (reuse channels)
const broadcastChannels = new Map<string, ReturnType<NonNullable<typeof supabase>['channel']>>()

// Get or create broadcast channel
function getBroadcastChannel(matchId: string) {
  if (!supabase) return null
  
  const channelKey = `chat:${matchId}`
  
  if (!broadcastChannels.has(channelKey)) {
    const channel = supabase.channel(channelKey, {
      config: {
        broadcast: { self: false }, // Don't send to sender to prevent duplicate
      },
    })
    
    // Subscribe channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Broadcast channel subscribed:', matchId)
      }
    })
    
    broadcastChannels.set(channelKey, channel)
  }
  
  return broadcastChannels.get(channelKey)!
}

// Types
export interface ChatMessage {
  id: string
  match_id: string
  username: string
  message: string
  created_at: string
}

export interface MatchViewer {
  match_id: string
  viewer_count: number
  updated_at: string
}

// Chat Functions
export async function sendMessage(matchId: string, username: string, message: string): Promise<{ error: any; data?: ChatMessage }> {
  if (!supabase) {
    return { error: 'Supabase not configured' }
  }
  
  if (!username.trim() || !message.trim()) {
    return { error: 'Username and message are required' }
  }

  // Insert to database for persistence
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      match_id: matchId,
      username: username.trim(),
      message: message.trim(),
    })
    .select()
    .single()

  if (error) {
    return { error }
  }

  // Broadcast message to channel for real-time delivery (no Replication needed)
  if (data) {
    const channel = getBroadcastChannel(matchId)
    if (channel) {
      const status = await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: data,
      })
      
      if (status !== 'ok') {
        console.warn('Broadcast status:', status, '- Message saved to database')
      }
    }
  }

  return { error: null, data: data as ChatMessage }
}

export async function getChatMessages(matchId: string, limit = 50): Promise<{ data: ChatMessage[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' }
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data ? data.reverse() : null, error }
}

export function subscribeToChat(
  matchId: string,
  callback: (message: ChatMessage) => void
): () => void {
  if (!supabase) {
    console.warn('Supabase not configured')
    return () => {}
  }

  // Reuse broadcast channel or create new one
  const channel = getBroadcastChannel(matchId)
  if (!channel) {
    return () => {}
  }

  // Listen to broadcast events
  channel.on(
    'broadcast',
    { event: 'message' },
    (payload) => {
      callback(payload.payload as ChatMessage)
    }
  )

  // Channel already subscribed by getBroadcastChannel
  // Just return cleanup function
  return () => {
    // Don't remove channel, keep it for reuse
    // Channel will be cleaned up when app closes
  }
}

// Match Functions
export async function ensureMatch(matchId: string, title: string): Promise<{ error: any }> {
  if (!supabase) {
    return { error: 'Supabase not configured' }
  }

  const { error } = await supabase
    .from('matches')
    .upsert(
      {
        id: matchId,
        title: title,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )

  return { error }
}

// Viewer Count Functions using Presence API for real-time online viewers
export function trackViewer(
  matchId: string,
  username: string,
  callback: (count: number) => void
): () => void {
  if (!supabase) {
    return () => {}
  }

  const channel = supabase.channel(`presence:${matchId}`, {
    config: {
      presence: {
        key: `${matchId}-${Date.now()}-${Math.random()}`,
      },
    },
  })

  // Helper to count unique presences
  const countPresences = () => {
    const state = channel.presenceState()
    // Count unique presence keys (each user has unique key)
    let count = 0
    Object.values(state).forEach((presences) => {
      count += presences.length
    })
    return count
  }

  // Track presence (online viewer)
  channel
    .on('presence', { event: 'sync' }, () => {
      callback(countPresences())
    })
    .on('presence', { event: 'join' }, () => {
      callback(countPresences())
    })
    .on('presence', { event: 'leave' }, () => {
      callback(countPresences())
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track this user as online
        await channel.track({
          username: username || 'Anonymous',
          joined_at: new Date().toISOString(),
        })
        // Initial count after tracking
        setTimeout(() => {
          callback(countPresences())
        }, 100)
      }
    })

  return () => {
    channel.untrack()
    supabase?.removeChannel(channel)
  }
}

