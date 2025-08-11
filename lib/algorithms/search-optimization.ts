// Trie data structure for efficient prefix searching
class TrieNode {
  children: Map<string, TrieNode> = new Map()
  isEndOfWord = false
  data: any[] = []
}

export class SearchTrie {
  private root: TrieNode = new TrieNode()

  // Insert a word with associated data
  insert(word: string, data: any): void {
    let current = this.root
    const normalizedWord = word.toLowerCase()

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
    }

    current.isEndOfWord = true
    current.data.push(data)
  }

  // Search for words with given prefix
  searchPrefix(prefix: string): any[] {
    const normalizedPrefix = prefix.toLowerCase()
    let current = this.root

    // Navigate to the prefix node
    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return []
      }
      current = current.children.get(char)!
    }

    // Collect all data from this node and its descendants
    const results: any[] = []
    this.collectAllData(current, results)
    return results
  }

  // Collect all data from a node and its descendants
  private collectAllData(node: TrieNode, results: any[]): void {
    if (node.isEndOfWord) {
      results.push(...node.data)
    }

    for (const child of node.children.values()) {
      this.collectAllData(child, results)
    }
  }

  // Get suggestions for autocomplete
  getSuggestions(prefix: string, maxResults = 10): string[] {
    const normalizedPrefix = prefix.toLowerCase()
    let current = this.root

    // Navigate to the prefix node
    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return []
      }
      current = current.children.get(char)!
    }

    // Collect all words with this prefix
    const suggestions: string[] = []
    this.collectWords(current, normalizedPrefix, suggestions, maxResults)
    return suggestions
  }

  // Collect words from a node
  private collectWords(node: TrieNode, currentWord: string, results: string[], maxResults: number): void {
    if (results.length >= maxResults) return

    if (node.isEndOfWord) {
      results.push(currentWord)
    }

    for (const [char, child] of node.children.entries()) {
      this.collectWords(child, currentWord + char, results, maxResults)
    }
  }
}

// Fuzzy search using Jaro-Winkler distance
export class FuzzySearch {
  // Calculate Jaro distance
  private static jaroDistance(s1: string, s2: string): number {
    if (s1 === s2) return 1.0

    const len1 = s1.length
    const len2 = s2.length

    if (len1 === 0 || len2 === 0) return 0.0

    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1
    if (matchWindow < 0) return 0.0

    const s1Matches = new Array(len1).fill(false)
    const s2Matches = new Array(len2).fill(false)

    let matches = 0
    let transpositions = 0

    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow)
      const end = Math.min(i + matchWindow + 1, len2)

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue
        s1Matches[i] = true
        s2Matches[j] = true
        matches++
        break
      }
    }

    if (matches === 0) return 0.0

    // Find transpositions
    let k = 0
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue
      while (!s2Matches[k]) k++
      if (s1[i] !== s2[k]) transpositions++
      k++
    }

    return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0
  }

  // Calculate Jaro-Winkler distance
  static jaroWinklerDistance(s1: string, s2: string): number {
    const jaroDistance = this.jaroDistance(s1.toLowerCase(), s2.toLowerCase())

    if (jaroDistance < 0.7) return jaroDistance

    // Calculate common prefix length (up to 4 characters)
    let prefixLength = 0
    const maxPrefix = Math.min(4, Math.min(s1.length, s2.length))

    for (let i = 0; i < maxPrefix; i++) {
      if (s1[i].toLowerCase() === s2[i].toLowerCase()) {
        prefixLength++
      } else {
        break
      }
    }

    return jaroDistance + 0.1 * prefixLength * (1 - jaroDistance)
  }

  // Search with fuzzy matching
  static search<T>(
    items: T[],
    query: string,
    getSearchText: (item: T) => string,
    threshold = 0.6,
    maxResults = 50,
  ): Array<{ item: T; score: number }> {
    const results = items
      .map((item) => ({
        item,
        score: this.jaroWinklerDistance(query, getSearchText(item)),
      }))
      .filter((result) => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    return results
  }
}

// Binary search for sorted arrays
export class BinarySearch {
  // Generic binary search
  static search<T>(array: T[], target: T, compareFn: (a: T, b: T) => number): number {
    let left = 0
    let right = array.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const comparison = compareFn(array[mid], target)

      if (comparison === 0) {
        return mid
      } else if (comparison < 0) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return -1 // Not found
  }

  // Find insertion point for maintaining sorted order
  static findInsertionPoint<T>(array: T[], target: T, compareFn: (a: T, b: T) => number): number {
    let left = 0
    let right = array.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)

      if (compareFn(array[mid], target) < 0) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    return left
  }

  // Search for range of values
  static searchRange<T>(array: T[], min: T, max: T, compareFn: (a: T, b: T) => number): T[] {
    const startIndex = this.findInsertionPoint(array, min, compareFn)
    const endIndex = this.findInsertionPoint(array, max, compareFn)

    return array.slice(startIndex, endIndex)
  }
}

// Search index for members
export const memberSearchIndex = new SearchTrie()
export const loanSearchIndex = new SearchTrie()

// Initialize search indices
export function initializeSearchIndices(members: any[], loans: any[]): void {
  // Clear existing indices
  memberSearchIndex.root = new TrieNode()
  loanSearchIndex.root = new TrieNode()

  // Index members
  members.forEach((member) => {
    memberSearchIndex.insert(member.firstName, member)
    memberSearchIndex.insert(member.lastName, member)
    memberSearchIndex.insert(member.memberNumber, member)
    memberSearchIndex.insert(member.nationalId, member)
    memberSearchIndex.insert(member.phone, member)
    if (member.email) {
      memberSearchIndex.insert(member.email, member)
    }
  })

  // Index loans
  loans.forEach((loan) => {
    loanSearchIndex.insert(loan.id, loan)
    if (loan.member) {
      loanSearchIndex.insert(`${loan.member.firstName} ${loan.member.lastName}`, loan)
    }
  })
}
