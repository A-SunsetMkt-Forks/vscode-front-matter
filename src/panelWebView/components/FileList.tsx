import * as React from 'react';
import { FileInfo } from '../../models';
import { FileItem } from './FileItem';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { VSCodeLabel } from './VSCode';

export interface IFileListProps {
  folderName: string;
  files: FileInfo[];
  totalFiles: number;
}

const FileList: React.FunctionComponent<IFileListProps> = ({
  files,
  folderName,
  totalFiles
}: React.PropsWithChildren<IFileListProps>) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className={`file_list`}>
      <VSCodeLabel>
        {folderName} - {files.length === 1 ? l10n.t(LocalizationKey.panelFileListLabelSingular) : l10n.t(LocalizationKey.panelFileListLabelPlural)}: {totalFiles}
      </VSCodeLabel>

      <ul className="file_list__items">
        {files &&
          files.length > 0 &&
          files.map((file) => (
            <FileItem
              key={file.filePath}
              name={file.fileName}
              path={file.filePath}
              folderName={file.folderName}
            />
          ))}
      </ul>
    </div>
  );
};

FileList.displayName = 'FileList';
export { FileList };
