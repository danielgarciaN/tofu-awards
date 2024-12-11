import React, { useState } from "react";
import { initializeApp } from "firebase/app"; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from "firebase/auth"; 
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import imageG from "./../../../assets/google.svg"; 
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import './Login.css';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6i7mGHA5uGX1Ctlzt_jlBD8T0K_caSHw",
  authDomain: "tofu-awards.firebaseapp.com",
  projectId: "tofu-awards",
  storageBucket: "tofu-awards.appspot.com",
  messagingSenderId: "384964093817",
  appId: "1:384964093817:web:c67af748562615b31eb1a8",
  measurementId: "G-C0MBZPT2NV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo estado para confirmación de contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true); 
  const [message, setMessage] = useState(""); 
  const navigate = useNavigate(); // Inicializa useNavigate

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificamos si el usuario ha verificado su email
      if (!user.emailVerified) {
        setMessage("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
        return;
      }

      console.log("Usuario autenticado:", user);
      setMessage(`¡Inicio de sesión exitoso! Usuario: ${user.email}`);
      navigate('/password-prompt'); // Redirige a la página de PasswordPrompt
    } catch (error) {
      console.error("Error al iniciar sesión:", error.code, error.message);
      if (error.code === 'auth/user-not-found') {
        setMessage("No hay un usuario registrado con ese correo electrónico.");
      } else if (error.code === 'auth/wrong-password') {
        setMessage("La contraseña es incorrecta.");
      } else {
        setMessage("Error al iniciar sesión: " + error.message);
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    // Verifica que las contraseñas coincidan
    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      return;
    }
  
    try {
      // Crear un nuevo usuario con email y contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Enviar email de verificación
      await sendEmailVerification(user);
      setMessage(`¡Registro exitoso! Verifica tu correo electrónico para continuar.`);
  
      // Guardar información adicional en Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });
  
      console.log("Usuario registrado:", user);
      navigate('/login'); // Redirige a la página de inicio de sesión
    } catch (error) {
      console.error("Error al registrarse:", error.message);
      setMessage("Error al registrarse: " + error.message);
    }
  };
  
  const handleResetPassword = async () => {
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email de restablecimiento de contraseña enviado");
    } catch (error) {
      console.error("Error al enviar el email de restablecimiento:", error.message);
      setMessage("Error al enviar el email de restablecimiento");
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Usuario autenticado con Google:", user);
      setMessage(`¡Inicio de sesión con Google exitoso! Usuario: ${user.email}`);
      navigate('/password-prompt'); // Redirige a la página de PasswordPrompt
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error.message);
      setMessage("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="login-page">
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../../assets/videos/login.mp4')} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      <div className="login-container">
        <div className="login-form">
          <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
          {message && <div className="message-container">{message}</div>} {/* Mensaje en pantalla */}
          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            <div className="input-field">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i className={`eye-icon ${showPassword ? "bx bx-show" : "bx bx-hide"}`} onClick={togglePasswordVisibility}></i>
            </div>
            {!isLogin && ( // Campo de confirmación de contraseña solo en el registro
              <div className="input-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <i className={`eye-icon ${showPassword ? "bx bx-show" : "bx bx-hide"}`} onClick={togglePasswordVisibility}></i>
              </div>
            )}
            <div className="form-link">
              <a href="#" className="forgot-pass" onClick={handleResetPassword}>¿Olvidaste la contraseña?</a>
            </div>
            <div className="button-field">
              <button type="submit">{isLogin ? "Iniciar Sesión" : "Registrarse"}</button>
            </div>
          </form>
          <div className="form-link">
            <span>
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} 
              <a href="#" className="signup-link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Registrate" : "Iniciar Sesión"}
              </a>
            </span>
          </div>
          <div className="divider">O</div>
          <div className="social-login">
            <button className="google-login" onClick={handleGoogleLogin}>
              <img src={imageG} alt="Google" style={{ width: '40px', marginRight: '0.5rem' }} />
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
