import { Menu } from '@headlessui/react';
import { FunnelIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { MenuButton, MenuItem, MenuItems } from '../Menu';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IFilterProps {
  label: string;
  items: string[];
  activeItem: string | null;
  onClick: (item: string | null) => void;
}

export const Filter: React.FunctionComponent<IFilterProps> = ({
  label,
  activeItem,
  items,
  onClick
}: React.PropsWithChildren<IFilterProps>) => {
  const DEFAULT_VALUE = l10n.t(LocalizationKey.dashboardHeaderFilterDefault);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton
          label={
            <>
              <FunnelIcon className={`inline-block w-5 h-5 mr-1`} />
              <span>{label}</span>
            </>
          }
          title={activeItem || DEFAULT_VALUE}
        />

        <MenuItems disablePopper>
          <MenuItem
            title={DEFAULT_VALUE}
            value={null}
            isCurrent={!!activeItem}
            onClick={() => onClick(null)}
          />

          {items.map((option) => (
            <MenuItem
              key={option}
              title={option}
              value={option}
              isCurrent={option === activeItem}
              onClick={() => onClick(option)}
            />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};
