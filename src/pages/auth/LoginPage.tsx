import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "@/shared/context/useAuth"
import styles from "./LoginPage.module.css"

const HERO_IMAGE = "https://lerefugedubandama.net/image3/DSC_2437.JPG"
const LOGO_SRC = "/logo-refuge-du-bandama.png"
const LOGO_ALT = "Le Refuge du Bandama"

export function LoginPage() {
  const [remember, setRemember] = useState(false)
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    login()
    navigate("/", { replace: true })
  }

  return (
    <div className={styles.shell}>
      <div className={styles.formColumn}>
        <div className={styles.formInner}>
          <div className={styles.logoWrap}>
            <img
              src={LOGO_SRC}
              alt={LOGO_ALT}
              className={styles.logo}
              width={120}
              height={120}
              decoding="async"
            />
          </div>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.subtitle}>Entrez vos identifiants de connexion.</p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-email">
                Adresse email
              </label>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="adresse email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-password">
                Mot de passe
              </label>
              <input
                id="login-password"
                className={styles.input}
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Mot de passe"
              />
            </div>

            <div className={styles.forgotRow}>
              <a className={styles.link} href="#mot-de-passe-oublie">
                Mot de passe oublié?
              </a>
            </div>

            <div className={styles.rememberRow}>
              <button
                type="button"
                className={styles.switch}
                data-on={remember ? "true" : "false"}
                onClick={() => setRemember((v) => !v)}
                aria-pressed={remember}
                aria-label="Se souvenir de moi"
              >
                <span className={styles.switchKnob} />
              </button>
              <span className={styles.rememberLabel}>Se souvenir de moi</span>
            </div>

            <button type="submit" className={styles.submit}>
              Se connecter
            </button>
          </form>

          <p className={styles.footer}>
            Vous n&apos;avez pas de compte?{" "}
            <a className={styles.footerLink} href="#inscription">
              Inscrivez vous.
            </a>
          </p>
        </div>
      </div>

      <div className={styles.visualColumn} aria-hidden>
        <div
          className={styles.visual}
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        />
      </div>
    </div>
  )
}
