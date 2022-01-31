import { useState, useEffect } from "react";

const BASE_URL = `https://degencointoss.s3.us-east-1.amazonaws.com`;

const urls = [
  `${BASE_URL}/mixkit-space-coin-win-notification-271.wav`,
  `${BASE_URL}/mixkit-arcade-retro-game-over-213.wav`,
  `${BASE_URL}/mixkit-coins-handling-1939.wav`,
  `${BASE_URL}/mixkit-gold-coin-prize-1999.wav`,
  `${BASE_URL}/mixkit-casino-bling-achievement-2067.wav`
];

export const useMultiAudio = () => {
  const [sources] = useState(
    urls.map(url => {
      const audio = new Audio(url);
      audio.volume = 0.69;
      audio.oncanplaythrough = false;
      return {
        url,
        audio,
      }
    }),
  )

  const [players, setPlayers] = useState(
    urls.map(url => {
      return {
        url,
        playing: false,
      }
    }),
  )

  const toggle = (targetIndex) => {
    const newPlayers = [...players]
    const currentIndex = players.findIndex(p => p.playing === true)
    if (currentIndex !== -1 && currentIndex !== targetIndex) {
      newPlayers[currentIndex].playing = false
      newPlayers[targetIndex].playing = true
    } else if (currentIndex !== -1) {
      newPlayers[targetIndex].playing = false
    } else {
      newPlayers[targetIndex].playing = true
    }
    setPlayers(newPlayers)
  }

  useEffect(() => {
    sources.forEach((source, i) => {
      players[i].playing ? source.audio.play() : source.audio.pause()
    })
  }, [sources, players])

  useEffect(() => {
    sources.forEach((source, i) => {
      source.audio.addEventListener('ended', () => {
        const newPlayers = [...players]
        newPlayers[i].playing = false
        setPlayers(newPlayers)
      })
    })
    return () => {
      sources.forEach((source, i) => {
        source.audio.removeEventListener('ended', () => {
          const newPlayers = [...players]
          newPlayers[i].playing = false
          setPlayers(newPlayers)
        })
      })
    }
  }, [])

  return [toggle]
}
