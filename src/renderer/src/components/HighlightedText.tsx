import { stripHtml, escapeRegex } from '../utils/search'

interface HighlightedTextProps {
  text: string
  query: string
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query.trim()) {
    return <>{text}</>
  }

  // Strip HTML tags for display
  const plainText = stripHtml(text)

  // Split query into individual terms
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) {
    return <>{plainText}</>
  }

  // Create regex to match any term (case-insensitive)
  const regex = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi')

  // Split text by matches
  const parts = plainText.split(regex)

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches any search term
        const isMatch = terms.some((term) => part.toLowerCase() === term.toLowerCase())

        return isMatch ? (
          <mark key={index} className="bg-yellow-500 text-black px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </>
  )
}
