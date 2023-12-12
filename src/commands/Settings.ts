import { TaxonomyHelper } from './../helpers/TaxonomyHelper';
import * as vscode from 'vscode';
import { TaxonomyType } from '../models';
import { EXTENSION_NAME } from '../constants';
import { ArticleHelper, FilesHelper } from '../helpers';
import { FrontMatterParser } from '../parsers';
import { Notifications } from '../helpers/Notifications';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export class Settings {
  /**
   * Create a new taxonomy
   *
   * @param type
   */
  public static async create(type: TaxonomyType) {
    const taxonomy = type === TaxonomyType.Tag ? 'tag' : 'category';

    const newOption = await vscode.window.showInputBox({
      prompt: l10n.t(LocalizationKey.commandsFoldersCreateInputPrompt, taxonomy),
      placeHolder: l10n.t(LocalizationKey.commandsFoldersCreateInputPlaceholder, taxonomy),
      ignoreFocusOut: true
    });

    if (newOption) {
      let options = (await TaxonomyHelper.get(type)) || [];

      if (options.find((o) => o === newOption)) {
        Notifications.warning(l10n.t(LocalizationKey.commandsSettingsCreateWarning, taxonomy));
        return;
      }

      options.push(newOption);
      TaxonomyHelper.update(type, options);

      // Ask if the new term needs to be added to the page
      const addToPage = await vscode.window.showQuickPick(
        [l10n.t(LocalizationKey.commonYes), l10n.t(LocalizationKey.commonNo)],
        {
          canPickMany: false,
          placeHolder: l10n.t(LocalizationKey.commandsSettingsCreateQuickPickPlaceholder, taxonomy),
          ignoreFocusOut: true
        }
      );

      if (addToPage && addToPage === l10n.t(LocalizationKey.commonYes)) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const article = ArticleHelper.getFrontMatter(editor);
        if (!article) {
          return;
        }

        const matterProp: string = taxonomy;
        // Add the selected options to the options array
        if (article.data[matterProp]) {
          const propData: string[] = article.data[matterProp];
          if (propData && !propData.find((o) => o === newOption)) {
            propData.push(newOption);
          }
        } else {
          article.data[matterProp] = [newOption];
        }

        ArticleHelper.update(editor, article);
      }
    }
  }

  /**
   * Export the tags/categories front matter to the user settings
   */
  public static async export() {
    // Retrieve all the Markdown files
    const allMdFiles = await FilesHelper.getAllFiles();
    if (!allMdFiles) {
      return;
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: l10n.t(LocalizationKey.commandsSettingsExportProgressTitle, EXTENSION_NAME),
        cancellable: false
      },
      async (progress) => {
        // Fetching all tags and categories from MD files
        let tags: string[] = [];
        let categories: string[] = [];

        // Set the initial progress
        const progressNr = allMdFiles.length / 100;
        progress.report({ increment: 0 });

        let i = 0;
        for (const file of allMdFiles) {
          progress.report({ increment: ++i / progressNr });
          const mdFile = await vscode.workspace.openTextDocument(file);
          if (mdFile) {
            const txtData = mdFile.getText();
            if (txtData) {
              try {
                const article = FrontMatterParser.fromFile(txtData);
                if (article && article.data) {
                  const { data } = article;
                  const mdTags = data['tags'];
                  const mdCategories = data['categories'];
                  if (mdTags) {
                    tags = [...tags, ...mdTags];
                  }
                  if (mdCategories) {
                    categories = [...categories, ...mdCategories];
                  }
                }
              } catch (e) {
                // Continue with the next file
              }
            }
          }
        }

        // Retrieve the currently known tags, and add the new ones
        let crntTags: string[] = (await TaxonomyHelper.get(TaxonomyType.Tag)) || [];
        if (!crntTags) {
          crntTags = [];
        }
        crntTags = [...crntTags, ...tags];
        // Update the tags and filter out the duplicates
        crntTags = [...new Set(crntTags)];
        crntTags = crntTags.sort().filter((t) => !!t);
        TaxonomyHelper.update(TaxonomyType.Tag, crntTags);

        // Retrieve the currently known tags, and add the new ones
        let crntCategories: string[] = (await TaxonomyHelper.get(TaxonomyType.Category)) || [];
        if (!crntCategories) {
          crntCategories = [];
        }
        crntCategories = [...crntCategories, ...categories];
        // Update the categories and filter out the duplicates
        crntCategories = [...new Set(crntCategories)];
        crntCategories = crntCategories.sort().filter((c) => !!c);
        TaxonomyHelper.update(TaxonomyType.Category, crntCategories);

        // Done
        Notifications.info(
          l10n.t(
            LocalizationKey.commandsSettingsExportProgressSuccess,
            crntTags.length,
            crntCategories.length
          )
        );
      }
    );
  }

  /**
   * Remap a tag or category to a new one
   */
  public static async remap() {
    const taxType = await vscode.window.showQuickPick(['Tag', 'Category'], {
      title: l10n.t(LocalizationKey.commandsSettingsRemapQuickpickTitle),
      placeHolder: l10n.t(LocalizationKey.commandsSettingsRemapQuickpickPlaceholder),
      canPickMany: false,
      ignoreFocusOut: true
    });

    if (!taxType) {
      return;
    }

    const type = taxType === 'Tag' ? TaxonomyType.Tag : TaxonomyType.Category;
    const taxonomy = type === TaxonomyType.Tag ? 'tags' : 'categories';
    const options = (await TaxonomyHelper.get(type)) || [];

    if (!options || options.length === 0) {
      Notifications.warning(
        l10n.t(LocalizationKey.commandsSettingsRemapNoTaxonomyWarning, taxonomy)
      );
      return;
    }

    const selectedOption = await vscode.window.showQuickPick(options, {
      placeHolder: l10n.t(LocalizationKey.commandsSettingsRemapSelectTaxonomyPlaceholder, taxonomy),
      canPickMany: false,
      ignoreFocusOut: true
    });

    if (!selectedOption) {
      return;
    }

    const newOptionValue = await vscode.window.showInputBox({
      prompt: l10n.t(
        LocalizationKey.commandsSettingsRemapNewOptionInputPrompt,
        taxonomy,
        selectedOption
      ),
      placeHolder: l10n.t(LocalizationKey.commandsSettingsRemapNewOptionInputPlaceholder, taxonomy),
      ignoreFocusOut: true
    });

    if (!newOptionValue) {
      const deleteAnswer = await vscode.window.showQuickPick(['yes', 'no'], {
        canPickMany: false,
        placeHolder: l10n.t(
          LocalizationKey.commandsSettingsRemapDeletePlaceholder,
          selectedOption,
          taxonomy
        ),
        ignoreFocusOut: true
      });
      if (deleteAnswer === 'no') {
        return;
      }
    }

    if (newOptionValue) {
      TaxonomyHelper.process('edit', type, selectedOption, newOptionValue);
    } else {
      TaxonomyHelper.process('delete', type, selectedOption, undefined);
    }
  }
}
