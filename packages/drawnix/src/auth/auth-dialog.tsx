import { useEffect, useState, type FormEvent } from 'react';
import { Dialog, DialogContent } from '../components/dialog/dialog';
import { CloseIcon, SparklesIcon } from '../components/icons';
import { useI18n } from '../i18n';
import { fetchAuthProviders, type AuthProvider } from './providers';
import { closeAuthDialog, openAuthDialog, signInWithPassword, signOut } from './session';
import { useAuthSession } from './use-auth-session';
import './auth-dialog.scss';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

type AuthDialogProps = {
  container?: HTMLElement | null;
};

export const AuthDialog = ({ container }: AuthDialogProps) => {
  const { t } = useI18n();
  const { dialogOpen, status, user } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const signedIn = status === 'signed-in' && user !== null;

  useEffect(() => {
    if (!dialogOpen || signedIn) {
      setProviders([]);
      return;
    }
    let cancelled = false;
    void fetchAuthProviders().then((nextProviders) => {
      if (!cancelled) {
        setProviders(nextProviders);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dialogOpen, signedIn]);

  useEffect(() => {
    if (!dialogOpen) {
      setPassword('');
      setFormError('');
    }
  }, [dialogOpen]);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password || submitting) {
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await signInWithPassword(email.trim(), password);
      setPassword('');
      closeAuthDialog();
    } catch (loginError) {
      setFormError(`${t('auth.error')}: ${getErrorMessage(loginError)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLogout = async () => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await signOut();
      closeAuthDialog();
    } catch (logoutError) {
      setFormError(`${t('auth.error')}: ${getErrorMessage(logoutError)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const initial = (
    Array.from((user?.displayName || user?.email || '?').trim())[0] || '?'
  ).toUpperCase();

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (open) {
          openAuthDialog();
        } else {
          closeAuthDialog();
        }
      }}
    >
      <DialogContent className="dx-auth" container={container} aria-label={t('auth.dialog.title')}>
        <button
          type="button"
          className="dx-auth__close"
          title={t('auth.dialog.close')}
          aria-label={t('auth.dialog.close')}
          onClick={() => closeAuthDialog()}
        >
          {CloseIcon}
        </button>

        <div className="dx-auth__brand" aria-hidden="true">
          {SparklesIcon}
        </div>

        {signedIn ? (
          <>
            <h2 className="dx-auth__title">{t('auth.dialog.signedInTitle')}</h2>
            <p className="dx-auth__description">{t('auth.dialog.signedInDescription')}</p>
            <div className="dx-auth__account">
              <span className="dx-auth__avatar" aria-hidden="true">
                {initial}
              </span>
              <span className="dx-auth__account-text">
                <strong>{user.displayName}</strong>
                <span>{user.email}</span>
              </span>
            </div>
            {formError && (
              <div className="dx-auth__error" role="alert">
                {formError}
              </div>
            )}
            <div className="dx-auth__actions">
              <button type="button" className="dx-auth__ghost" onClick={() => closeAuthDialog()}>
                {t('auth.dialog.close')}
              </button>
              <button
                type="button"
                className="dx-auth__danger"
                disabled={submitting}
                onClick={() => void submitLogout()}
              >
                {t('auth.signOut')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="dx-auth__title">{t('auth.dialog.title')}</h2>
            <p className="dx-auth__description">{t('auth.dialog.description')}</p>

            <form className="dx-auth__form" onSubmit={(event) => void submitLogin(event)}>
              <label className="dx-auth__field">
                <span>{t('auth.email')}</span>
                <input
                  type="email"
                  value={email}
                  autoComplete="username"
                  autoFocus
                  required
                  disabled={submitting}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="dx-auth__field">
                <span>{t('auth.password')}</span>
                <input
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {formError && (
                <div className="dx-auth__error" role="alert">
                  {formError}
                </div>
              )}
              <button
                type="submit"
                className="dx-auth__submit"
                disabled={submitting || !email.trim() || !password}
              >
                {submitting ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            </form>

            {providers.length > 0 && (
              <div className="dx-auth__providers">
                <div className="dx-auth__divider">
                  <span>{t('auth.or')}</span>
                </div>
                {providers.map((provider) => (
                  <a key={provider.id} className="dx-auth__provider" href={provider.startUrl}>
                    {provider.name}
                  </a>
                ))}
              </div>
            )}

            <p className="dx-auth__note">{t('auth.dialog.note')}</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
