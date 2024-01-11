import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VsTableCell, VsTableRow } from './VscodeComponents';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ISeoKeywordInfoProps {
  keyword: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  wordCount?: number;
  headings?: string[];
}

const SeoKeywordInfo: React.FunctionComponent<ISeoKeywordInfoProps> = ({
  keyword,
  title,
  description,
  slug,
  content,
  wordCount,
  headings
}: React.PropsWithChildren<ISeoKeywordInfoProps>) => {
  const density = () => {
    if (!wordCount) {
      return null;
    }

    const pattern = new RegExp(`(^${keyword.toLowerCase()}(?=\\s|$))|(\\s${keyword.toLowerCase()}(?=\\s|$))`, 'ig');
    const count = (content.match(pattern) || []).length;
    const density = (count / wordCount) * 100;
    const densityTitle = l10n.t(LocalizationKey.panelSeoKeywordInfoDensity, `${density.toFixed(2)}%`);

    if (density < 0.75) {
      return <ValidInfo label={densityTitle} isValid={false} />;
    } else if (density >= 0.75 && density < 1.5) {
      return <ValidInfo label={densityTitle} isValid={true} />;
    } else {
      return <ValidInfo label={densityTitle} isValid={false} />;
    }
  };

  const validateKeywords = (heading: string, keyword: string) => {
    const keywords = keyword.toLowerCase().split(' ');

    if (keywords.length > 1) {
      return heading.toLowerCase().includes(keyword.toLowerCase());
    } else {
      return (
        heading
          .toLowerCase()
          .split(' ')
          .findIndex((word) => word.toLowerCase() === keyword.toLowerCase()) !== -1
      );
    }
  };

  const checkHeadings = () => {
    if (!headings || headings.length === 0) {
      return null;
    }

    const exists = headings.filter((heading) => validateKeywords(heading, keyword));
    return <ValidInfo label={l10n.t(LocalizationKey.panelSeoKeywordInfoValidInfoLabel)} isValid={exists.length > 0} />;
  };

  if (!keyword || typeof keyword !== 'string') {
    return null;
  }

  return (
    <VsTableRow>
      <VsTableCell className={`table__cell`}>{keyword}</VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation table__cell__seo_details`}>
        <div>
          <ValidInfo
            label={l10n.t(LocalizationKey.commonTitle)}
            isValid={!!title && title.toLowerCase().includes(keyword.toLowerCase())}
          />
        </div>
        <div>
          <ValidInfo
            label={l10n.t(LocalizationKey.commonDescription)}
            isValid={!!description && description.toLowerCase().includes(keyword.toLowerCase())}
          />
        </div>
        <div>
          <ValidInfo
            label={l10n.t(LocalizationKey.commonSlug)}
            isValid={
              !!slug &&
              (slug.toLowerCase().includes(keyword.toLowerCase()) ||
                slug.toLowerCase().includes(keyword.replace(/ /g, '-').toLowerCase()))
            }
          />
        </div>
        <div>
          <ValidInfo
            label={l10n.t(LocalizationKey.panelSeoKeywordInfoValidInfoContent)}
            isValid={!!content && content.toLowerCase().includes(keyword.toLowerCase())}
          />
        </div>
        {headings && headings.length > 0 && <div>{checkHeadings()}</div>}
        {wordCount && <div>{density()}</div>}
      </VsTableCell>
    </VsTableRow>
  );
};

SeoKeywordInfo.displayName = 'SeoKeywordInfo';
export { SeoKeywordInfo };
