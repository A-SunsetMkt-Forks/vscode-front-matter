import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsAtom, TabInfoAtom } from '../../state';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IStatusProps {
  draft: boolean | string;
  published: number | null | undefined;
}

export const Status: React.FunctionComponent<IStatusProps> = ({
  draft,
  published
}: React.PropsWithChildren<IStatusProps>) => {
  const settings = useRecoilValue(SettingsAtom);
  const tabInfo = useRecoilValue(TabInfoAtom);

  const draftField = useMemo(() => settings?.draftField, [settings]);
  const isFuture = useMemo(() => published ? published > Date.now() : false, [published]);

  const draftValue = useMemo(() => {
    if (draftField && draftField.type === 'choice') {
      return draft;
    } else if (draftField && typeof draftField.invert !== 'undefined' && draftField.invert) {
      return !draft;
    } else {
      return draft;
    }
  }, [draftField, draft]);

  if (settings?.draftField && settings.draftField.type === 'choice') {
    if (draftValue) {
      return (
        <span
          className={`inline-block px-1 py-1 leading-none rounded-sm font-semibold uppercase tracking-wide text-[0.7rem] text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)]`}
        >
          {draftValue}
        </span>
      );
    } else {
      return null;
    }
  }

  if (tabInfo && Object.keys(tabInfo).length <= 1) {
    return null;
  }

  return (
    <span
      className={`draft__status
        inline-block px-1 py-1 leading-none rounded-sm font-semibold uppercase tracking-wide text-[0.7rem] 
        ${draftValue ?
          'bg-[var(--vscode-statusBarItem-errorBackground)] text-[var(--vscode-statusBarItem-errorForeground)]' :
          isFuture ?
            'bg-[var(--vscode-statusBarItem-warningBackground)] text-[var(--vscode-statusBarItem-warningForeground)]' :
            'bg-[var(--vscode-badge-background)] text-[var(--vscode-badge-foreground)]'
        }`}
    >
      {
        draftValue ?
          l10n.t(LocalizationKey.dashboardContentsStatusDraft) : (
            isFuture ?
              l10n.t(LocalizationKey.dashboardContentsStatusScheduled) :
              l10n.t(LocalizationKey.dashboardContentsStatusPublished)
          )
      }
    </span>
  );
};
