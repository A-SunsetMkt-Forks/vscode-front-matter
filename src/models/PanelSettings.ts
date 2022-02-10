import { FileStat } from "vscode";
import { DraftField } from ".";
import { Choice } from "./Choice";
import { DashboardData } from "./DashboardData";
import { DataType } from "./DataType";

export interface PanelSettings {
  seo: SEO;
  slug: Slug;
  tags: string[];
  date: DateInfo;
  categories: string[];
  customTaxonomy: CustomTaxonomy[];
  freeform: boolean;
  scripts: CustomScript[];
  isInitialized: boolean;
  modifiedDateUpdate: boolean;
  writingSettingsEnabled: boolean;
  fmHighlighting: boolean;
  preview: PreviewSettings;
  contentTypes: ContentType[];
  dashboardViewData: DashboardData | undefined;
  draftField: DraftField;
  isBacker: boolean | undefined;
  framework: string | undefined;
  commands: FrameworkCommands;
  dataTypes: DataType[] | undefined;
}

export interface FrameworkCommands {
  start: string | undefined;
}

export interface ContentType {
  name: string;
  fields: Field[];

  fileType?: "md" | "mdx" | string;
  previewPath?: string | null;
  pageBundle?: boolean;
}

export type FieldType = "string" | "number" | "datetime" | "boolean" | "image" | "choice" | "tags" | "categories" | "draft" | "taxonomy" | "fields" | "data-collection";

export interface Field {
  title?: string;
  name: string;
  type: FieldType;
  choices?: string[] | Choice[];
  single?: boolean;
  multiple?: boolean;
  isPreviewImage?: boolean;
  hidden?: boolean;
  taxonomyId?: string;
  default?: string;
  fields?: Field[];
  dataType?: string;
}

export interface DateInfo {
  format: string;
}

export interface SEO {
  title: number;
  slug: number;
  description: number;
  content: number;
  descriptionField: string;
}

export interface Slug {
  prefix: number;
  suffix: number;
}

export interface FolderInfo {
  title: string;
  files: number;
  lastModified: FileInfo[];
}

export interface FileInfo extends FileStat {
  filePath: string;
  fileName: string;
};

export interface CustomScript {
  title: string;
  script: string;
  nodeBin?: string;
  bulk?: boolean;
  output?: "notification" | "editor";
  outputType?: string;
  type?: ScriptType;
}

export interface PreviewSettings {
  host: string | undefined;
  pathname: string | undefined;
}

export interface CustomTaxonomy {
  id: string;
  options: string[];
}

export enum ScriptType {
  Content = "content",
  MediaFolder = "mediaFolder",
  MediaFile = "mediaFile"
}