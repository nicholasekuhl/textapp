const supabase = require('../db')

// Increments conversations.message_count by 1.
// Fire-and-forget: logs failure but never throws to the caller.
//
// Requires the `increment_message_count` Postgres function — run in Supabase SQL editor:
//   CREATE OR REPLACE FUNCTION increment_message_count(conv_id UUID)
//   RETURNS void AS $$
//     UPDATE conversations
//     SET message_count = COALESCE(message_count, 0) + 1
//     WHERE id = conv_id;
//   $$ LANGUAGE sql;
async function bumpMessageCount(conversationId) {
  if (!conversationId) return
  try {
    const { error } = await supabase.rpc('increment_message_count', { conv_id: conversationId })
    if (error) console.error('[bumpMessageCount]', error.message)
  } catch (err) {
    console.error('[bumpMessageCount]', err.message)
  }
}

module.exports = { bumpMessageCount }
