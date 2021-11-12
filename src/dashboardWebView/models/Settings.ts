import { VersionInfo } from '../../models/VersionInfo';
import { ViewType } from '../state';
import { ContentFolder } from '../../models/ContentFolder';
import { ContentType, DraftField, Framework, SortingSetting } from '../../models';
import { SortingOption } from './SortingOption';

export interface Settings { 
  beta: boolean;
  initialized: boolean;
  wsFolder: string; 
  staticFolder: string; 
  folders: ContentFolder[]; 
  tags: string[];
  categories: string[];
  openOnStart: boolean | null;
  versionInfo: VersionInfo;
  pageViewType: ViewType | undefined;
  mediaSnippet: string[];
  contentTypes: ContentType[];
  contentFolders: ContentFolder[];
  crntFramework: string;
  framework: Framework | null | undefined;
  draftField: DraftField | null | undefined;
  customSorting: SortingSetting[] | undefined;
  dashboardState: DashboardState;
}

export interface DashboardState {
  sorting: SortingOption | null | undefined;
}