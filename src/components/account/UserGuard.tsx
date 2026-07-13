import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useSupabaseBrowserClient} from '../../lib/supabaseClient';

function GuardClient({children}: {children: React.ReactNode}): React.ReactElement {
  const {client} = useSupabaseBrowserClient();
  const loginUrl = useBaseUrl('/login');
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const redirect = (): void => {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`${loginUrl}?next=${encodeURIComponent(next)}`);
    };
    void client.auth.getSession().then(({data}) => {
      if (!active) return;
      if (data.session) setAllowed(true);
      else redirect();
    });
    const {data: listener} = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) setAllowed(true);
      else redirect();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client, loginUrl]);

  return allowed ? <>{children}</> : <main style={{minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#667085', fontSize: 13}}>正在检查账户...</main>;
}

export default function UserGuard({children}: {children: React.ReactNode}): React.ReactElement {
  return <BrowserOnly fallback={<main style={{minHeight: '60vh'}} />}>{() => <GuardClient>{children}</GuardClient>}</BrowserOnly>;
}
