import * as Octokit from '@octokit/rest';
import { authentication, ExtensionContext } from 'vscode';

const GITHUB_AUTH_PROVIDER_ID = 'github';
// The GitHub Authentication Provider accepts the scopes described here:
// https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/
const SCOPES = ['user:email'];

export class Credentials {
  private octokit: Octokit.Octokit | undefined;

  async initialize(context: ExtensionContext, callback: () => void): Promise<void> {
    this.registerListeners(context, callback);
    this.setOctokit();
  }

  private async setOctokit() {
    /**
     * By passing the `createIfNone` flag, a numbered badge will show up on the accounts activity bar icon.
     * An entry for the sample extension will be added under the menu to sign in. This allows quietly
     * prompting the user to sign in.
     * */
    const session = await authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, {
      silent: true
    });

    if (session) {
      this.octokit = new Octokit.Octokit({
        auth: session.accessToken
      });

      return;
    }

    this.octokit = undefined;
  }

  registerListeners(context: ExtensionContext, callback: () => void): void {
    /**
     * Sessions are changed when a user logs in or logs out.
     */
    context.subscriptions.push(
      authentication.onDidChangeSessions(async (e) => {
        if (e.provider.id === GITHUB_AUTH_PROVIDER_ID) {
          await this.setOctokit();

          if (callback) {
            callback();
          }
        }
      })
    );
  }

  async getOctokit(): Promise<Octokit.Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    /**
     * When the `createIfNone` flag is passed, a modal dialog will be shown asking the user to sign in.
     * Note that this can throw if the user clicks cancel.
     */
    const session = await authentication.getSession(GITHUB_AUTH_PROVIDER_ID, SCOPES, {
      silent: true
    });

    if (!session) {
      throw new Error('No GitHub authentication session available.');
    }

    this.octokit = new Octokit.Octokit({
      auth: session.accessToken
    });

    return this.octokit;
  }
}
