import { useRecoilState, useRecoilValue } from 'recoil';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { DashboardMessage } from '../../DashboardMessage';
import { Page } from '../../models/Page';
import { MultiSelectedItemsAtom, SettingsSelector, ViewSelector } from '../../state';
import { DateField } from '../Common/DateField';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardViewType } from '../../models';
import { ContentActions } from './ContentActions';
import { useCallback, useMemo } from 'react';
import { Status } from './Status';
import * as React from 'react';
import useExtensibility from '../../hooks/useExtensibility';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../..';
import useCard from '../../hooks/useCard';
import { I18nLabel } from './I18nLabel';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';

export interface IItemProps extends Page { }

const PREVIEW_IMAGE_FIELD = 'fmPreviewImage';

export const Item: React.FunctionComponent<IItemProps> = ({
  ...pageData
}: React.PropsWithChildren<IItemProps>) => {
  const view = useRecoilValue(ViewSelector);
  const settings = useRecoilValue(SettingsSelector);
  const [selectedFiles, setSelectedFiles] = useRecoilState(MultiSelectedItemsAtom);
  const draftField = useMemo(() => settings?.draftField, [settings]);
  const cardFields = useMemo(() => settings?.dashboardState?.contents?.cardFields, [settings?.dashboardState?.contents?.cardFields]);
  const { escapedTitle, escapedDescription } = useCard(pageData, settings?.dashboardState?.contents?.cardFields);
  const navigate = useNavigate();
  const { titleHtml, descriptionHtml, dateHtml, statusHtml, tagsHtml, imageHtml, footerHtml } = useExtensibility({
    fmFilePath: pageData.fmFilePath,
    date: pageData.date,
    title: pageData.title,
    description: pageData.description,
    type: pageData.type,
    pageData
  });

  const openFile = () => {
    Messenger.send(DashboardMessage.openFile, pageData.fmFilePath);
  };

  const tags: string[] | undefined = useMemo(() => {
    if (!settings?.dashboardState?.contents?.tags) {
      return undefined;
    }

    const tagField = settings.dashboardState.contents.tags;
    let tagsValue = [];

    if (tagField === 'tags') {
      tagsValue = pageData.fmTags;
    } else if (tagField === 'categories') {
      tagsValue = pageData.fmCategories;
    } else {
      tagsValue = pageData[tagField] || [];
    }

    if (typeof tagsValue === 'string') {
      return [tagsValue];
    } else if (Array.isArray(tagsValue)) {
      const items = tagsValue.map(t => typeof t === 'string' ? t : undefined);
      return items.filter(t => t !== undefined) as string[];
    }

    return [];
  }, [settings, pageData]);

  const statusPlaceholder = useMemo(() => {
    if (!statusHtml && !cardFields?.state) {
      return null;
    }

    return (
      statusHtml ? (
        <div dangerouslySetInnerHTML={{ __html: statusHtml }} />
      ) : (
        cardFields?.state && draftField && draftField.name && typeof pageData[draftField.name] !== "undefined" ? <Status draft={pageData[draftField.name]} published={pageData.fmPublished} /> : null
      )
    )
  }, [statusHtml, cardFields?.state, draftField, pageData]);

  const datePlaceholder = useMemo(() => {
    if (!dateHtml && !cardFields?.date) {
      return null;
    }

    return (
      dateHtml ? (
        <div className='mr-4' dangerouslySetInnerHTML={{ __html: dateHtml }} />
      ) : (
        cardFields?.date && pageData.date ? <DateField className={`mr-4`} value={pageData.date} format={pageData.fmDateFormat} /> : null
      )
    )
  }, [dateHtml, cardFields?.date, pageData]);

  const hasDraftOrDate = useMemo(() => {
    return cardFields && (cardFields.state || cardFields.date);
  }, [cardFields]);

  const onMultiSelect = useCallback(() => {
    if (selectedFiles.includes(pageData.fmFilePath)) {
      setSelectedFiles(selectedFiles.filter((file) => file !== pageData.fmFilePath));
    } else {
      setSelectedFiles([...selectedFiles, pageData.fmFilePath]);
    }
  }, [selectedFiles]);

  if (view === DashboardViewType.Grid) {
    return (
      <li className="relative">
        <div
          className={`group flex flex-col items-start content-start h-full w-full text-left shadow-md dark:shadow-none hover:shadow-xl border rounded bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-sideBarTitle-foreground)] border-[var(--frontmatter-border)]`}
        >
          <button
            title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
            onClick={openFile}
            className={`relative h-36 w-full overflow-hidden border-b cursor-pointer border-[var(--frontmatter-border)]`}
          >
            {
              imageHtml ?
                <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: imageHtml }} /> :
                pageData[PREVIEW_IMAGE_FIELD] ? (
                  <img
                    src={`${pageData[PREVIEW_IMAGE_FIELD]}`}
                    alt={escapedTitle || ""}
                    className="absolute inset-0 h-full w-full object-cover object-left-top group-hover:brightness-75"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`h-full flex items-center justify-center bg-[var(--vscode-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)]`}
                  >
                    <MarkdownIcon className={`h-32 text-[var(--vscode-sideBarTitle-foreground)] opacity-80`} />
                  </div>
                )
            }
          </button>

          <div className={`${selectedFiles.includes(pageData.fmFilePath) ? 'block' : 'hidden'} group-hover:block absolute top-2 left-2 white`}>
            <VSCodeCheckbox
              onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                e.stopPropagation();
                onMultiSelect();
              }}
              checked={selectedFiles.includes(pageData.fmFilePath)} />
          </div>

          <div className="relative p-4 w-full grow">
            {
              (statusPlaceholder || datePlaceholder) && (
                <div className={`flex justify-between items-center ${hasDraftOrDate ? `mb-2` : ``}`}>
                  {statusPlaceholder}
                  {datePlaceholder}
                </div>
              )
            }

            <ContentActions
              title={pageData.title}
              path={pageData.fmFilePath}
              relPath={pageData.fmRelFileWsPath}
              locale={pageData.fmLocale}
              isDefaultLocale={pageData.fmDefaultLocale}
              translations={pageData.fmTranslations}
              scripts={settings?.scripts}
              onOpen={openFile}
            />

            <I18nLabel page={pageData} />

            <button
              title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
              onClick={openFile}
              className={`text-left block`}>
              {
                titleHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: titleHtml }} />
                ) : (
                  <h2 className="font-bold">
                    <span>{escapedTitle}</span>
                  </h2>
                )
              }
            </button>

            {
              (escapedDescription || descriptionHtml) && (
                <button
                  title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
                  onClick={openFile}
                  className={`mt-2 text-left block`}>
                  {
                    descriptionHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                    ) : (
                      <p className={`text-xs text-[vara(--vscode-titleBar-activeForeground)]`}>{escapedDescription}</p>
                    )
                  }
                </button>
              )
            }

            {
              tagsHtml ? (
                <div className="mt-2" dangerouslySetInnerHTML={{ __html: tagsHtml }} />
              ) : (
                tags && tags.length > 0 && (
                  <div className="mt-2">
                    {tags.map(
                      (tag, index) => tag && (
                        <button
                          key={index}
                          className={`inline-block mr-1 mt-1 text-xs text-[var(--vscode-textPreformat-foreground)] hover:brightness-75 hover:underline hover:underline-offset-1`}
                          title={l10n.t(LocalizationKey.commonFilterValue, tag)}
                          onClick={() => {
                            const tagField = settings?.dashboardState.contents.tags;
                            if (tagField) {
                              navigate(`${routePaths.contents}?taxonomy=${tagField}&value=${tag}`);
                            }
                          }}
                        >
                          #{tag}
                        </button>
                      )
                    )}
                  </div>
                )
              )
            }
          </div>

          {
            footerHtml && (
              <div className="placeholder__card__footer p-4 w-full" dangerouslySetInnerHTML={{ __html: footerHtml }} />
            )
          }
        </div>
      </li>
    );
  } else if (view === DashboardViewType.List) {
    return (
      <li className="relative">
        <div
          className={`px-5 cursor-pointer w-full text-left grid grid-cols-12 gap-x-4 sm:gap-x-6 xl:gap-x-8 py-2 border-b hover:bg-opacity-70 border-[var(--frontmatter-border)] hover:bg-[var(--vscode-sideBar-background)]`}
        >
          <div className="col-span-8 font-bold truncate flex items-center space-x-4">
            <button
              title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
              onClick={openFile}>
              {escapedTitle}
            </button>

            <ContentActions
              title={escapedTitle || ""}
              path={pageData.fmFilePath}
              relPath={pageData.fmRelFileWsPath}
              scripts={settings?.scripts}
              onOpen={openFile}
              listView
            />
          </div>
          <div className="col-span-2">
            <DateField value={pageData.date} />
          </div>
          <div className="col-span-2">
            {draftField && draftField.name && <Status draft={pageData[draftField.name]} published={pageData.fmPublished} />}
          </div>
        </div>
      </li>
    );
  }

  return null;
};
