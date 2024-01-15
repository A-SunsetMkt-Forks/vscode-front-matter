import { messageHandler } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import { SettingsSelector } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IProjectSwitcherProps { }

export const ProjectSwitcher: React.FunctionComponent<IProjectSwitcherProps> = (props: React.PropsWithChildren<IProjectSwitcherProps>) => {
  const [crntProject, setCrntProject] = React.useState<string | undefined>(undefined);
  const settings = useRecoilValue(SettingsSelector);

  const project = settings?.project;
  const projects = settings?.projects || [];

  const setProject = (value: string) => {
    setCrntProject(value);
    messageHandler.send(DashboardMessage.switchProject, value)
  }

  React.useEffect(() => {
    setCrntProject(project?.name);
  }, [project]);

  if (projects.length <= 1 || !crntProject) {
    return null;
  }

  return (
    <div className="flex items-center mr-4 z-[51]">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton
          label={(
            <div className="inline-flex items-center">
              <ArrowsRightLeftIcon className="h-4 w-4 mr-2" />
              <span>{l10n.t(LocalizationKey.dashboardHeaderProjectSwitcherLabel)}</span>
            </div>
          )}
          title={crntProject} />

        <MenuItems disablePopper>
          {projects.map((p) => (
            <MenuItem
              key={p.name}
              title={p.name}
              value={p.name}
              isCurrent={p.name === crntProject}
              onClick={(value) => setProject(p.name)}
            />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};