export const moods = [
  { value: "joyful", emoji: "😊", label: "Joyful", tint: "bg-[#ffe4a8]" },
  { value: "tender", emoji: "🥰", label: "Tender", tint: "bg-[#ffd7eb]" },
  { value: "playful", emoji: "🤭", label: "Playful", tint: "bg-[#ffe3c4]" },
  { value: "grateful", emoji: "🙏", label: "Grateful", tint: "bg-[#dce6ff]" },
  { value: "calm", emoji: "🌙", label: "Calm", tint: "bg-[#e8e0ff]" },
  { value: "adventurous", emoji: "✨", label: "Adventurous", tint: "bg-[#d6f2ff]" }
] as const;

export const moodMap = Object.fromEntries(moods.map((mood) => [mood.value, mood]));
