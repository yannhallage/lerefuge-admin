import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import styles from "./RouteChangeLoader.module.css"

const LOADER_DURATION_MS = 700
const LOADER_LOGO_URL = "logo-refuge-du-bandama.png"
export function RouteChangeLoader() {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setIsVisible(true)
    const timer = window.setTimeout(() => {
      setIsVisible(false)
    }, LOADER_DURATION_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.search, location.hash])

  if (!isVisible) {
    return null
  }

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label="Chargement de la page">
      <div className={styles.content}>
        <img className={styles.logo} src={LOADER_LOGO_URL} alt="Logo Le Refuge du Bandama" />
        <p className={styles.text}>Chargement...</p>
      </div>
    </div>
  )
}
