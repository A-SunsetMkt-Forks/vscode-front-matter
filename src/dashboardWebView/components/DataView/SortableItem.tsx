import { PencilIcon, TrashIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { SortableHandle, SortableElement } from 'react-sortable-hoc';
import { LinkButton } from '../Common/LinkButton';
import { Alert } from '../Modals/Alert';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISortableItemProps {
  value: string;
  index: number;
  crntIndex: number;
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number) => void;
  onDeleteItem: (index: number) => void;
}

const DragHandle = SortableHandle(() => <ChevronUpDownIcon className={`w-6 h-6 mr-2 cursor-move hover:text-[var(--frontmatter-link-hover)]`} />);

export const SortableItem = SortableElement(
  ({
    value,
    selectedIndex,
    crntIndex,
    onSelectedIndexChange,
    onDeleteItem
  }: ISortableItemProps) => {
    const [showAlert, setShowAlert] = React.useState(false);

    const deleteItemConfirm = () => {
      setShowAlert(true);
    };

    return (
      <>
        <li
          data-test={`${selectedIndex}-${crntIndex}`}
          className={`sortable_item py-2 px-2 w-full flex justify-between content-center cursor-pointer ${selectedIndex === crntIndex ? `bg-[var(--frontmatter-list-selected-background)] text-[var(--frontmatter-list-selected-text)]` : ``
            } hover:bg-[var(--frontmatter-list-hover-background)]`}
        >
          <div
            className="flex items-center w-full"
            onClick={() => onSelectedIndexChange(crntIndex)}
          >
            <DragHandle />
            <span>{value}</span>
          </div>

          <div className={`space-x-2 flex items-center`}>
            <LinkButton
              title={l10n.t(LocalizationKey.dashboardDataViewSortableItemEditButtonTitle)}
              onClick={() => onSelectedIndexChange(crntIndex)}>
              <PencilIcon className="w-4 h-4" />
              <span className="sr-only">{l10n.t(LocalizationKey.commonEdit)}</span>
            </LinkButton>

            <LinkButton
              title={l10n.t(LocalizationKey.dashboardDataViewSortableItemDeleteButtonTitle)}
              onClick={() => deleteItemConfirm()}>
              <TrashIcon className="w-4 h-4" />
              <span className="sr-only">{l10n.t(LocalizationKey.commonDelete)}</span>
            </LinkButton>
          </div>
        </li>

        {showAlert && (
          <Alert
            title={l10n.t(LocalizationKey.dashboardDataViewSortableItemAlertTitle)}
            description={l10n.t(LocalizationKey.dashboardDataViewSortableItemAlertDescription)}
            okBtnText={l10n.t(LocalizationKey.commonDelete)}
            cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
            dismiss={() => setShowAlert(false)}
            trigger={() => {
              setShowAlert(false);
              onDeleteItem(crntIndex);
            }}
          />
        )}
      </>
    );
  }
);
