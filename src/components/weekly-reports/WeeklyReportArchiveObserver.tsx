import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {listFilesByContext, type FileRecord} from '../../lib/adminApi';
import {useSupabaseBrowserClient} from '../../lib/supabaseClient';

interface Props {
  reportId: string;
  onFilesChange: (files: FileRecord[]) => void;
}

function ObserverClient({reportId, onFilesChange}: Props): null {
  const {client} = useSupabaseBrowserClient();

  React.useEffect(() => {
    let active = true;
    void listFilesByContext(client, 'weekly-report', reportId)
      .then((files) => {
        if (active) onFilesChange(files);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [client, onFilesChange, reportId]);

  return null;
}

export default function WeeklyReportArchiveObserver(props: Props): React.ReactElement {
  return <BrowserOnly fallback={null}>{() => <ObserverClient {...props} />}</BrowserOnly>;
}
