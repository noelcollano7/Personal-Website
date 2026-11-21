import { useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react'

const MUSIC_URL = '/audio/welcome-on-in-noel.mp3'
const DEFAULT_VOLUME = 0.4

export default function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [needsInteraction, setNeedsInteraction] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = DEFAULT_VOLUME
    let disposed = false

    const attemptPlayback = () => {
      void audio.play().then(() => {
        if (!disposed) {
          setIsPlaying(true)
          setNeedsInteraction(false)
        }
      }).catch(() => {
        if (!disposed) setNeedsInteraction(true)
      })
    }

    const enableAfterInteraction = () => {
      if (audio.paused) attemptPlayback()
      window.removeEventListener('pointerdown', enableAfterInteraction)
      window.removeEventListener('keydown', enableAfterInteraction)
    }

    attemptPlayback()
    window.addEventListener('pointerdown', enableAfterInteraction, { once: true })
    window.addEventListener('keydown', enableAfterInteraction, { once: true })

    return () => {
      disposed = true
      window.removeEventListener('pointerdown', enableAfterInteraction)
      window.removeEventListener('keydown', enableAfterInteraction)
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
        setNeedsInteraction(false)
      } catch {
        setNeedsInteraction(true)
      }
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setNeedsInteraction(true)}
      />
      <aside className="music-player" aria-label="Background music controls">
        {needsInteraction && !isPlaying && (
          <span className="music-player__hint" role="status">Click to enable music</span>
        )}
        <span className={`music-player__visual${isPlaying ? ' is-playing' : ''}`} aria-hidden="true">
          <Music2 size={16} />
          <span className="music-player__bars"><i /><i /><i /></span>
        </span>
        <button
          type="button"
          className="music-player__button"
          onClick={() => void togglePlayback()}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
          title={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button
          type="button"
          className="music-player__button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
          title={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </aside>
    </>
  )
}
