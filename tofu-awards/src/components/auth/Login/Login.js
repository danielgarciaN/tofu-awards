import React, { useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import imageG from "./../../../assets/google.svg";
import "./Login.css";
import { auth, db, googleProvider } from "../../../firebase";
import { clearStoredAccessMode } from "../../../utils/accessMode";

const getFriendlyAuthMessage = (errorCode, isGoogleFlow = false) => {
  switch (errorCode) {
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "No hemos podido validar ese correo o esa contrasena.";
    case "auth/wrong-password":
      return "La contrasena no es correcta.";
    case "auth/invalid-email":
      return "Introduce un correo valido.";
    case "auth/email-already-in-use":
      return "Ese correo ya esta asociado a una cuenta.";
    case "auth/weak-password":
      return "La contrasena debe tener al menos 6 caracteres.";
    case "auth/popup-blocked":
      return "El navegador ha bloqueado la ventana emergente. Vamos a usar redireccion.";
    case "auth/popup-closed-by-user":
      return "Se ha cerrado la ventana antes de completar el acceso con Google.";
    case "auth/unauthorized-domain":
      return "Este dominio no esta autorizado en Firebase Auth. Revisa los dominios permitidos en consola.";
    case "auth/account-exists-with-different-credential":
      return isGoogleFlow
        ? "Ya existe una cuenta con este correo usando otro metodo de acceso."
        : "Ese correo ya tiene otro metodo de acceso asociado.";
    default:
      return "No se ha podido completar la autenticacion. Intentalo de nuevo.";
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResolvingRedirect, setIsResolvingRedirect] = useState(true);

  const isBusy = isSubmitting || isGoogleLoading || isResolvingRedirect;
  const heroHighlights = useMemo(
    () => [
      "Segunda edicion, mas tarde que nunca.",
      "Acceso optimizado para votar tambien desde movil.",
      "Una experiencia mas limpia, estable y lista para la gala.",
    ],
    []
  );

  useEffect(() => {
    clearStoredAccessMode();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await getRedirectResult(auth);

        if (!isMounted || !result?.user) {
          return;
        }

        await upsertUserProfile(result.user);
        setFeedback({
          type: "success",
          text: "Acceso con Google completado. Entrando en la gala...",
        });
        navigate("/home", { replace: true });
      } catch (error) {
        if (isMounted) {
          setFeedback({
            type: "error",
            text: getFriendlyAuthMessage(error.code, true),
          });
        }
      } finally {
        if (isMounted) {
          setIsResolvingRedirect(false);
        }
      }
    };

    setupAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const upsertUserProfile = async (user, extraData = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    await setDoc(
      userRef,
      {
        email: user.email || "",
        displayName: user.displayName || "",
        lastLoginAt: serverTimestamp(),
        ...(userSnapshot.exists() ? {} : { createdAt: serverTimestamp() }),
        ...extraData,
      },
      { merge: true }
    );
  };

  const resetFeedback = () => setFeedback({ type: "", text: "" });

  const handleLogin = async (event) => {
    event.preventDefault();
    resetFeedback();
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const { user } = userCredential;

      if (!user.emailVerified) {
        setFeedback({
          type: "error",
          text: "Antes de entrar debes verificar tu correo electronico.",
        });
        setIsSubmitting(false);
        return;
      }

      await upsertUserProfile(user);
      setFeedback({
        type: "success",
        text: "Sesion iniciada. Redirigiendo a la home...",
      });
      navigate("/home", { replace: true });
    } catch (error) {
      setFeedback({
        type: "error",
        text: getFriendlyAuthMessage(error.code),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    resetFeedback();

    if (password.length < 6) {
      setFeedback({
        type: "error",
        text: "La contrasena debe tener al menos 6 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        type: "error",
        text: "Las contrasenas no coinciden.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const { user } = userCredential;

      await sendEmailVerification(user);
      await upsertUserProfile(user, { createdAt: serverTimestamp() });
      setFeedback({
        type: "success",
        text: "Cuenta creada. Revisa tu correo y verifica la direccion antes de iniciar sesion.",
      });
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setFeedback({
        type: "error",
        text: getFriendlyAuthMessage(error.code),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    resetFeedback();

    if (!email.trim()) {
      setFeedback({
        type: "error",
        text: "Escribe primero tu correo para enviarte el enlace de recuperacion.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setFeedback({
        type: "success",
        text: "Te hemos enviado un enlace para restablecer la contrasena.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: getFriendlyAuthMessage(error.code),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetFeedback();
    setIsGoogleLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const prefersRedirect =
        typeof window !== "undefined" &&
        (window.matchMedia("(max-width: 768px)").matches ||
          /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent));

      if (prefersRedirect) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      await upsertUserProfile(result.user);
      setFeedback({
        type: "success",
        text: "Acceso con Google completado. Entrando en la gala...",
      });
      navigate("/home", { replace: true });
    } catch (error) {
      const canFallbackToRedirect = [
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
      ].includes(error.code);

      if (canFallbackToRedirect) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          setFeedback({
            type: "error",
            text: getFriendlyAuthMessage(redirectError.code, true),
          });
        }
      } else {
        setFeedback({
          type: "error",
          text: getFriendlyAuthMessage(error.code, true),
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-ambient" />
      <section className="login-hero">
        <p className="login-kicker">Tofu Awards II</p>
        <h1>La segunda gala ya esta en marcha.</h1>
        <p className="login-lead">
          Llega mas tarde que nunca, con mas historias, mas recuerdos y una novedad importante:
          ahora toda la votacion esta preparada tambien para movil.
        </p>
        <ul className="login-highlights">
          {heroHighlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </section>

      <section className="login-container">
        <div className="login-form">
          <p className="login-panel-kicker">{isLogin ? "Acceso privado" : "Registro"}</p>
          <h2>{isLogin ? "Entra en la gala" : "Crea tu acceso"}</h2>
          <p className="login-panel-copy">
            {isLogin
              ? "Accede con tu cuenta para entrar directamente en la home y continuar con las votaciones."
              : "Registra tu cuenta para participar en la segunda edicion de los Tofu Awards."}
          </p>

          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            <label className="input-field">
              <span>Correo electronico</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="input-field">
              <span>Contrasena</span>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="Introduce tu contrasena"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>

            {!isLogin && (
              <label className="input-field">
                <span>Confirmar contrasena</span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repite tu contrasena"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            )}

            <div className="login-actions-row">
              <button
                type="button"
                className="text-button"
                onClick={handleResetPassword}
                disabled={isBusy}
              >
                Recuperar contrasena
              </button>
            </div>

            {feedback.text ? (
              <div className={`message-container ${feedback.type}`} aria-live="polite">
                {feedback.text}
              </div>
            ) : null}

            <div className="button-field">
              <button type="submit" disabled={isBusy}>
                {isBusy
                  ? "Procesando..."
                  : isLogin
                    ? "Entrar en Tofu Awards"
                    : "Crear cuenta"}
              </button>
            </div>
          </form>

          <div className="form-link">
            <span>{isLogin ? "Aun no tienes cuenta?" : "Ya tienes cuenta?"}</span>
            <button
              type="button"
              className="text-button inline"
              onClick={() => {
                resetFeedback();
                setIsLogin((current) => !current);
                setPassword("");
                setConfirmPassword("");
              }}
              disabled={isBusy}
            >
              {isLogin ? "Registrate" : "Inicia sesion"}
            </button>
          </div>

          <div className="divider">
            <span>o</span>
          </div>

          <div className="social-login">
            <button className="google-login" onClick={handleGoogleLogin} disabled={isBusy}>
              <img src={imageG} alt="" aria-hidden="true" />
              {isGoogleLoading ? "Conectando con Google..." : "Continuar con Google"}
            </button>
          </div>

          <p className="login-footnote">
            Si el popup de Google falla en produccion o en movil, la app cambiara automaticamente a
            redireccion segura.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
