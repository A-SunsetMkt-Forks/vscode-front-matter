import { commands, env } from 'vscode';
import { SettingsListener } from '.';
import { COMMAND_NAME } from '../../constants';
import { DashboardMessage } from '../../dashboardWebView/DashboardMessage';
import { CustomScript, Extension } from '../../helpers';
import { openFileInEditor } from '../../helpers/openFileInEditor';
import { PostMessageData } from '../../models';
import { BaseListener } from './BaseListener';

export class ExtensionListener extends BaseListener {
  public static process(msg: PostMessageData) {
    super.process(msg);

    switch (msg.command) {
      case DashboardMessage.openFile:
        openFileInEditor(msg.payload);
        break;
      case DashboardMessage.initializeProject:
        commands.executeCommand(COMMAND_NAME.init, SettingsListener.getSettings);
        break;
      case DashboardMessage.copyToClipboard:
        env.clipboard.writeText(msg.payload);
        break;
      case DashboardMessage.runCustomScript:
        CustomScript.run(msg?.payload?.script, msg?.payload?.path);
        break;
      case DashboardMessage.setState:
        this.setState(msg?.payload);
        break;
      case DashboardMessage.getState:
        this.getState(msg.command, msg?.payload, msg.requestId);
        break;
    }
  }

  private static setState(data: any) {
    const { key, value } = data;
    if (key && value) {
      Extension.getInstance().setState(key, value, 'workspace');
    }
  }

  private static async getState(command: string, data: any, requestId?: string) {
    if (!command || !requestId || !data) {
      return;
    }

    const { key } = data;
    if (key) {
      const value = await Extension.getInstance().getState<any | undefined>(key, 'workspace');

      this.sendRequest(command as any, requestId, { key, value });
    }
  }
}
