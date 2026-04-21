import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { useAuth } from "@/shared/context/useAuth"
import { ApiError } from "@/api/types"
import styles from "./LoginPage.module.css"

const HERO_IMAGE = "https://lerefugedubandama.net/image3/DSC_2437.JPG"
const LOGO_SRC = "/logo-refuge-du-bandama.png"
const LOGO_ALT = "Le Refuge du Bandama"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

type FormFieldErrors = {
  email?: string
  password?: string
}

function validateLoginFields(email: string, password: string): FormFieldErrors {
  const errors: FormFieldErrors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    errors.email = "L'adresse email est obligatoire."
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = "Veuillez saisir une adresse email valide."
  }

  if (!password.trim()) {
    errors.password = "Le mot de passe est obligatoire."
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
  }

  return errors
}

export function LoginPage() {
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const validationErrors = validateLoginFields(email, password)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate("/", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Impossible de se connecter. Veuillez réessayer.")
      }
    } finally {
      setIsSubmitting(false)
    }
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
                value={email}
                onChange={(e) => {
                  const nextEmail = e.target.value
                  setEmail(nextEmail)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              />
              {fieldErrors.email ? (
                <p id="login-email-error" role="alert" style={{ color: "#c62828", margin: 0, fontSize: "0.875rem" }}>
                  {fieldErrors.email}
                </p>
              ) : null}
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
                value={password}
                onChange={(e) => {
                  const nextPassword = e.target.value
                  setPassword(nextPassword)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
              />
              {fieldErrors.password ? (
                <p id="login-password-error" role="alert" style={{ color: "#c62828", margin: 0, fontSize: "0.875rem" }}>
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {error ? (
              <p role="alert" style={{ color: "#c62828", margin: 0 }}>
                {error}
              </p>
            ) : null}

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

            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className={styles.submitContent}>
                  <BeatLoader size={8} color="#ffffff" loading={isSubmitting} aria-label="Chargement" />
                  {/* Connexion... */}
                </span>
              ) : (
                "Se connecter"
              )}
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
