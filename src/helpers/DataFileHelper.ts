import { Folders } from '../commands/Folders';
import { DataFile } from '../models';
import * as yaml from 'js-yaml';
import { Logger } from './Logger';
import { Notifications } from './Notifications';
import { commands } from 'vscode';
import { COMMAND_NAME, SETTING_DATA_FILES } from '../constants';
import { Settings } from './SettingsHelper';
import { existsAsync, readFileAsync } from '../utils';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../localization';

export class DataFileHelper {
  /**
   * Retrieve the file data
   * @param filePath
   * @returns
   */
  public static async get(filePath: string) {
    const absPath = Folders.getAbsFilePath(filePath);
    if (await existsAsync(absPath)) {
      return await readFileAsync(absPath, 'utf8');
    }

    return null;
  }

  /**
   * Get by the id of the data file
   * @param id
   */
  public static getById(id: string) {
    const files = Settings.get<DataFile[]>(SETTING_DATA_FILES);

    if (!files || files.length === 0) {
      return;
    }

    const file = files.find((f) => f.id === id);

    if (!file) {
      return;
    }

    return DataFileHelper.process(file);
  }

  /**
   * Process the data file
   * @param data
   * @returns
   */
  public static async process(data: DataFile) {
    try {
      const { file, fileType } = data;
      const dataFile = await DataFileHelper.get(file);

      if (fileType === 'yaml') {
        return yaml.safeLoad(dataFile || '');
      } else {
        return dataFile ? JSON.parse(dataFile) : undefined;
      }
    } catch (ex) {
      Logger.error(`DataFileHelper::process: ${(ex as Error).message}`);
      Notifications.errorWithOutput(l10n.t(LocalizationKey.helpersDataFileHelperProcessError));
      return;
    }
  }
}
