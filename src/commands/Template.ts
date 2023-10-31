import { Questions } from './../helpers/Questions';
import * as vscode from 'vscode';
import * as path from 'path';
import {
  SETTING_CONTENT_DEFAULT_FILETYPE,
  SETTING_TEMPLATES_FOLDER,
  TelemetryEvent
} from '../constants';
import { ArticleHelper, Settings } from '../helpers';
import { Article } from '.';
import { Notifications } from '../helpers/Notifications';
import { Project } from './Project';
import { ContentType } from '../helpers/ContentType';
import { ContentType as IContentType } from '../models';
import { PagesListener } from '../listeners/dashboard';
import { extname } from 'path';
import { Telemetry } from '../helpers/Telemetry';
import { writeFileAsync, copyFileAsync } from '../utils';

export class Template {
  /**
   * Generate a template
   */
  public static async generate() {
    const folder = Template.getSettings();
    const editor = vscode.window.activeTextEditor;
    const fileType = Settings.get<string>(SETTING_CONTENT_DEFAULT_FILETYPE);

    if (folder && editor && ArticleHelper.isSupportedFile()) {
      const article = ArticleHelper.getFrontMatter(editor);
      const clonedArticle = Object.assign({}, article);

      const titleValue = await vscode.window.showInputBox({
        title: `Template title`,
        prompt: `What name would you like to give your template?`,
        placeHolder: `article`,
        ignoreFocusOut: true
      });

      if (!titleValue) {
        Notifications.warning(`You did not specify a template title.`);
        return;
      }

      const keepContents = await vscode.window.showQuickPick(['yes', 'no'], {
        title: `Keep contents`,
        canPickMany: false,
        placeHolder: `Do you want to keep the contents for the template?`,
        ignoreFocusOut: true
      });

      if (!keepContents) {
        Notifications.warning(
          `You did not pick any of the options for keeping the template its content.`
        );
        return;
      }

      await Project.init(false);
      const templatePath = Project.templatePath();
      if (templatePath) {
        const fileContents = ArticleHelper.stringifyFrontMatter(
          keepContents === 'no' ? '' : clonedArticle.content,
          clonedArticle.data
        );

        const templateFile = path.join(templatePath.fsPath, `${titleValue}.${fileType}`);
        await writeFileAsync(templateFile, fileContents, { encoding: 'utf-8' });

        Notifications.info(`Template created and is now available in your ${folder} folder.`);
      }
    }
  }

  /**
   * Retrieve all templates
   */
  public static async getTemplates() {
    const folder = Settings.get<string>(SETTING_TEMPLATES_FOLDER);

    if (!folder) {
      Notifications.warning(`No templates found.`);
      return;
    }

    return await vscode.workspace.findFiles(
      `${folder}/**/*`,
      '**/node_modules/**,**/archetypes/**'
    );
  }

  /**
   * Create from a template
   */
  public static async create(folderPath: string) {
    const contentTypes = ContentType.getAll();

    if (!folderPath) {
      Notifications.warning(`Incorrect project folder path retrieved.`);
      return;
    }

    const templates = await Template.getTemplates();
    if (!templates || templates.length === 0) {
      Notifications.warning(`No templates found.`);
      return;
    }

    const selectedTemplate = await vscode.window.showQuickPick(
      templates.map((t) => path.basename(t.fsPath)),
      {
        title: `Select a template`,
        placeHolder: `Select the content template to use`,
        ignoreFocusOut: true
      }
    );
    if (!selectedTemplate) {
      Notifications.warning(`No template selected.`);
      return;
    }

    const titleValue = await Questions.ContentTitle();
    if (!titleValue) {
      return;
    }

    // Start the template read
    const template = templates.find((t) => t.fsPath.endsWith(selectedTemplate));
    if (!template) {
      Notifications.warning(`Content template could not be found.`);
      return;
    }

    const templateData = await ArticleHelper.getFrontMatterByPath(template.fsPath);
    let contentType: IContentType | undefined;
    if (templateData && templateData.data && templateData.data.type) {
      contentType = contentTypes?.find((t) => t.name === templateData.data.type);
    }

    const fileExtension = extname(template.fsPath).replace('.', '');
    const newFilePath: string | undefined = await ArticleHelper.createContent(
      contentType,
      folderPath,
      titleValue,
      fileExtension
    );
    if (!newFilePath) {
      return;
    }

    // Start the new file creation
    await copyFileAsync(template.fsPath, newFilePath);

    // Update the properties inside the template
    let frontMatter = await ArticleHelper.getFrontMatterByPath(newFilePath);
    if (!frontMatter) {
      Notifications.warning(`Something failed when retrieving the newly created file.`);
      return;
    }

    if (frontMatter.data) {
      frontMatter.data = await ArticleHelper.updatePlaceholders(
        frontMatter.data,
        titleValue,
        newFilePath
      );

      const article = Article.updateDate(frontMatter);

      if (!article) {
        return;
      }

      await writeFileAsync(
        newFilePath,
        ArticleHelper.stringifyFrontMatter(article.content, article.data),
        { encoding: 'utf8' }
      );

      await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(newFilePath));
    }

    const txtDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse(newFilePath));
    if (txtDoc) {
      vscode.window.showTextDocument(txtDoc);
    }

    Notifications.info(`Your new content has been created.`);

    Telemetry.send(TelemetryEvent.createContentFromTemplate);

    // Trigger a refresh for the dashboard
    PagesListener.refresh();
  }

  /**
   * Get the folder settings
   */
  public static getSettings() {
    const folder = Settings.get<string>(SETTING_TEMPLATES_FOLDER);
    return folder;
  }
}
