import { useQuery, useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useWebRTC } from '../components/WebRTCProvider'

function generateURL(slug: string): string {
  const hostPrefix =
    window.location.protocol +
    '//' +
    window.location.hostname +
    (['80', '443'].includes(window.location.port)
      ? ''
      : ':' + window.location.port)
  return `${hostPrefix}/download/${slug}`
}

export function useUploaderChannel(
  uploadID: string,
  renewInterval = 5000,
): {
  isLoading: boolean
  error: Error | null
  longSlug: string | undefined
  shortSlug: string | undefined
  longURL: string | undefined
  shortURL: string | undefined
} {
  const peer = useWebRTC()
  const { isLoading, error, data } = useQuery({
    queryKey: ['uploaderChannel', uploadID],
    queryFn: async () => {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  const secret = data?.secret
  const longSlug = data?.longSlug
  const shortSlug = data?.shortSlug
  const longURL = longSlug ? generateURL(longSlug) : undefined
  const shortURL = shortSlug ? generateURL(shortSlug) : undefined

  const renewMutation = useMutation({
    mutationFn: async ({ secret: s }: { secret: string }) => {
      const response = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: shortSlug, secret: s }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
  })

  const answerMutation = useMutation({
    mutationFn: async ({ offerID, answer }: { offerID: string, answer: RTCSessionDescriptionInit }) => {
      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: shortSlug, offerID, answer }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
  })

  useEffect(() => {
    if (!secret || !shortSlug) return

    let timeout: NodeJS.Timeout | null = null

    const run = (): void => {
      timeout = setTimeout(() => {
        renewMutation.mutate(
          { secret },
          {
            onSuccess: (d) => {
              Object.entries(d.offers).forEach(async ([offerID, offer]) => {
                try {
                  const answer = await peer.createAnswer(offer as RTCSessionDescriptionInit)
                  peer.onDataChannel((channel) => {
                    console.log('Data channel opened', channel)
                  })
                  console.log('Created answer:', answer)
                  answerMutation.mutate({ offerID, answer })
                } catch (e) {
                  console.error('Error creating answer:', e)
                }
              })
            },
          },
        )
        run()
      }, renewInterval)
    }

    run()

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [secret, shortSlug, renewMutation, answerMutation, renewInterval])

  return {
    isLoading,
    error,
    longSlug,
    shortSlug,
    longURL,
    shortURL,
  }
}
