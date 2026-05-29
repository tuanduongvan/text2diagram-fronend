import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword
} from 'firebase/auth';
import { auth } from '../firebase';
import { LoginSchemaType, RegisterSchemaType } from '../validations';
import { CustomError } from '@/utils';

interface IAuthContext {
  user: User | null;
  isAuth: boolean;
  register: (credentials: RegisterSchemaType) => Promise<void>;
  login: (credentials: LoginSchemaType) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext({} as IAuthContext);

export const useAuthContext = (): IAuthContext => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    () => JSON.parse(localStorage.getItem('user') as string) || null
  );
  const isAuth = useMemo(() => {
    return Boolean(user);
  }, [user]);

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  const login = async (credentials: LoginSchemaType): Promise<void> => {
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (!userCredential.user?.emailVerified) {
      throw new CustomError(
        'Your email is not verified, please check your email for confirmation',
        400
      );
    }
  };
  const register = async (credentials: RegisterSchemaType): Promise<void> => {
    const { email, password } = credentials;
    await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(auth.currentUser as User);
  };
  const forgotPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };
  const changePassword = async (newPassword: string): Promise<void> => {
    await updatePassword(auth.currentUser as User, newPassword);
  };
  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('workspaceId');
  };
  const loginSuccess = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (
        !user?.emailVerified &&
        user?.providerData[0].providerId === 'password'
      ) {
        await logout();
      } else {
        if (user) {
          loginSuccess(user as User);
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        register,
        login,
        loginWithGoogle,
        logout,
        forgotPassword,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
