import * as React from 'react';
import { PencilIcon, ChevronUpDownIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SortableHandle, SortableElement } from 'react-sortable-hoc';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IJsonFieldRecordProps {
  id: number;
  index: number;
  label: string;
  isSelected?: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DragHandle = SortableHandle(() => (
  <span className="drag_handler">
    <ChevronUpDownIcon />
  </span>
));

export const JsonFieldRecord = SortableElement(
  ({ label, id, onEdit, onDelete, isSelected }: React.PropsWithChildren<IJsonFieldRecordProps>) => {
    return (
      <li className={`json_data__record ${isSelected ? `json_data__record_selected` : ``}`}>
        <div>
          <DragHandle />

          <span>
            {label} - {id + 1}
          </span>
        </div>

        <div>
          <button
            title={l10n.t(LocalizationKey.commonEdit)}
            className="json_data__list__button json_data__list__button_edit"
            onClick={() => onEdit(id)}
          >
            <PencilIcon className="json_data__list__button_icon" />
            <span className="sr-only">{l10n.t(LocalizationKey.commonEdit)}</span>
          </button>
          <button
            title={l10n.t(LocalizationKey.commonDelete)}
            className="json_data__list__button json_data__list__button_delete"
            onClick={() => onDelete(id)}
          >
            <TrashIcon className="json_data__list__button_icon" />
            <span className="sr-only">{l10n.t(LocalizationKey.commonDelete)}</span>
          </button>
        </div>
      </li>
    );
  }
);
