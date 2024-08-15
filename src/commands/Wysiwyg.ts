import { commands, window, Selection, QuickPickItem, TextEditor } from 'vscode';
import { COMMAND_NAME, CONTEXT, SETTING_CONTENT_WYSIWYG } from '../constants';
import { Settings } from '../helpers';
import { LocalizationKey, localize } from '../localization';

enum MarkupType {
  bold = 1,
  italic,
  strikethrough,
  code,
  codeblock,
  blockquote,
  heading,
  unorderedList,
  orderedList,
  taskList,
  hyperlink
}

export class Wysiwyg {
  /**
   * Registers the markup commands for the WYSIWYG controls
   * @param subscriptions
   * @returns
   */
  public static async registerCommands(subscriptions: unknown[]) {
    const wysiwygEnabled = Settings.get(SETTING_CONTENT_WYSIWYG);

    if (!wysiwygEnabled) {
      return;
    }

    await commands.executeCommand('setContext', CONTEXT.wysiwyg, true);

    // Surrounding markup
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.bold, () => this.addMarkup(MarkupType.bold))
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.italic, () => this.addMarkup(MarkupType.italic))
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.strikethrough, () =>
        this.addMarkup(MarkupType.strikethrough)
      )
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.code, () => this.addMarkup(MarkupType.code))
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.codeblock, () => this.addMarkup(MarkupType.codeblock))
    );

    // Prefix markup
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.heading, () => this.addMarkup(MarkupType.heading))
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.blockquote, () => this.addMarkup(MarkupType.blockquote))
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.unorderedlist, () =>
        this.addMarkup(MarkupType.unorderedList)
      )
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.orderedlist, () =>
        this.addMarkup(MarkupType.orderedList)
      )
    );
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.taskList, () => this.addMarkup(MarkupType.taskList))
    );

    // Other markup
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.hyperlink, () => this.addMarkup(MarkupType.hyperlink))
    );

    // Options
    subscriptions.push(
      commands.registerCommand(COMMAND_NAME.options, async () => {
        const qpItems: QuickPickItem[] = [
          {
            label: `$(list-unordered) ${localize(LocalizationKey.commandsWysiwygCommandUnorderedListLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandUnorderedListDetail),
            alwaysShow: true
          },
          {
            label: `$(list-ordered) ${localize(LocalizationKey.commandsWysiwygCommandOrderedListLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandOrderedListDetail),
            alwaysShow: true
          },
          {
            label: `$(tasklist) ${localize(LocalizationKey.commandsWysiwygCommandTaskListLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandTaskListDetail),
            alwaysShow: true
          },
          {
            label: `$(code) ${localize(LocalizationKey.commandsWysiwygCommandCodeLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandCodeDetail),
            alwaysShow: true
          },
          {
            label: `$(symbol-namespace) ${localize(LocalizationKey.commandsWysiwygCommandCodeblockLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandCodeblockDetail),
            alwaysShow: true
          },
          {
            label: `$(quote) ${localize(LocalizationKey.commandsWysiwygCommandBlockquoteLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandBlockquoteDetail),
            alwaysShow: true
          },
          {
            label: `$(symbol-text) ${localize(LocalizationKey.commandsWysiwygCommandStrikethroughLabel)}`,
            detail: localize(LocalizationKey.commandsWysiwygCommandStrikethroughDetail),
            alwaysShow: true
          }
        ];

        const option = await window.showQuickPick([...qpItems], {
          title: localize(LocalizationKey.commandsWysiwygQuickPickTitle),
          placeHolder: localize(LocalizationKey.commandsWysiwygQuickPickPlaceholder),
          canPickMany: false,
          ignoreFocusOut: true
        });

        if (option) {
          if (option.label === qpItems[0].label) {
            await this.addMarkup(MarkupType.unorderedList);
          } else if (option.label === qpItems[1].label) {
            await this.addMarkup(MarkupType.orderedList);
          } else if (option.label === qpItems[2].label) {
            await this.addMarkup(MarkupType.taskList);
          } else if (option.label === qpItems[3].label) {
            await this.addMarkup(MarkupType.code);
          } else if (option.label === qpItems[4].label) {
            await this.addMarkup(MarkupType.codeblock);
          } else if (option.label === qpItems[5].label) {
            await this.addMarkup(MarkupType.blockquote);
          } else if (option.label === qpItems[6].label) {
            await this.addMarkup(MarkupType.strikethrough);
          }
        }
      })
    );
  }

  /**
   * Add the markup to the content
   * @param type
   * @returns
   */
  private static async addMarkup(type: MarkupType) {
    const editor = window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const hasTextSelection = !selection.isEmpty;

    if (type === MarkupType.hyperlink) {
      return this.addHyperlink(editor, selection);
    }

    const markers = this.getMarkers(type);
    if (!markers) {
      return;
    }

    const crntSelection = selection.active;

    if (hasTextSelection) {
      // Replace the selection and surround with the markup
      const selectionText = editor.document.getText(selection);
      const txt = await this.insertText(markers, type, selectionText);

      editor.edit((builder) => {
        builder.replace(selection, txt);
      });
    } else {
      const txt = await this.insertText(markers, type);

      // Insert the markers where cursor is located.
      const markerLength = this.isMarkupWrapping(type) ? txt.length + 1 : markers.length;
      let newPosition = crntSelection.with(
        crntSelection.line,
        crntSelection.character + markerLength
      );

      await editor.edit((builder) => {
        builder.insert(newPosition, txt);
      });

      if (type === MarkupType.codeblock) {
        newPosition = crntSelection.with(crntSelection.line + 1, 0);
      }

      editor.selection = new Selection(newPosition, newPosition);
    }
  }

  /**
   * Add a hyperlink to the content
   * @returns void
   */
  private static async addHyperlink(editor: TextEditor, selection: Selection) {
    const hasTextSelection = !selection.isEmpty;
    const linkText = hasTextSelection ? editor.document.getText(selection) : '';

    const link = await window.showInputBox({
      title: localize(LocalizationKey.commandsWysiwygAddHyperlinkHyperlinkInputTitle),
      placeHolder: localize(LocalizationKey.commandsWysiwygAddHyperlinkHyperlinkInputPrompt),
      prompt: localize(LocalizationKey.commandsWysiwygAddHyperlinkHyperlinkInputPrompt),
      value: linkText,
      ignoreFocusOut: true
    });

    const text = await window.showInputBox({
      title: localize(LocalizationKey.commandsWysiwygAddHyperlinkTextInputTitle),
      prompt: localize(LocalizationKey.commandsWysiwygAddHyperlinkTextInputPrompt),
      placeHolder: localize(LocalizationKey.commandsWysiwygAddHyperlinkTextInputPrompt),
      value: linkText,
      ignoreFocusOut: true
    });

    if (link) {
      const txt = `[${text || link}](${link})`;

      if (hasTextSelection) {
        editor.edit((builder) => {
          builder.replace(selection, txt);
        });
      } else {
        const crntSelection = selection.active;
        const markerLength = txt.length;
        const newPosition = crntSelection.with(
          crntSelection.line,
          crntSelection.character + markerLength
        );

        await editor.edit((builder) => {
          builder.insert(newPosition, txt);
        });

        editor.selection = new Selection(newPosition, newPosition);
      }
    }
  }

  /**
   * Check if the text will be wrapped
   * @param type
   * @returns
   */
  private static isMarkupWrapping(type: MarkupType) {
    return (
      type === MarkupType.blockquote ||
      type === MarkupType.heading ||
      type === MarkupType.unorderedList ||
      type === MarkupType.orderedList ||
      type === MarkupType.taskList
    );
  }

  /**
   * Insert text at the current cursor position
   */
  private static async insertText(
    marker: string | undefined,
    type: MarkupType,
    text: string | null = null
  ) {
    const crntText = text || this.lineBreak(type);

    if (this.isMarkupWrapping(type)) {
      if (type === MarkupType.heading) {
        const headingLvl = await window.showQuickPick(
          ['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'],
          {
            title: localize(LocalizationKey.commandsWysiwygInsertTextHeadingInputTitle),
            placeHolder: localize(LocalizationKey.commandsWysiwygInsertTextHeadingInputPlaceholder),
            canPickMany: false,
            ignoreFocusOut: true
          }
        );

        if (headingLvl) {
          const headingNr = parseInt(headingLvl.replace('Heading ', ''));
          return `${Array(headingNr + 1).join(marker)} ${crntText}`;
        }
      }

      if (type === MarkupType.unorderedList || type === MarkupType.taskList) {
        const lines = crntText.split('\n').map((line) => `${marker} ${line}`);
        return lines.join('\n');
      }

      if (type === MarkupType.orderedList) {
        const lines = crntText.split('\n').map((line, idx) => `${idx + 1}. ${line}`);
        return lines.join('\n');
      }

      return `${marker} ${crntText}`;
    } else {
      return `${marker}${crntText}${marker}`;
    }
  }

  /**
   * Check if linebreak needs to be added
   * @param type
   * @returns
   */
  private static lineBreak(type: MarkupType) {
    if (type === MarkupType.codeblock) {
      return `\n\n`;
    }
    return '';
  }

  /**
   * Retrieve the type of markers
   * @param type
   * @returns
   */
  private static getMarkers(type: MarkupType) {
    switch (type) {
      case MarkupType.bold:
        return `**`;
      case MarkupType.italic:
        return `*`;
      case MarkupType.strikethrough:
        return `~~`;
      case MarkupType.code:
        return '`';
      case MarkupType.codeblock:
        return '```';
      case MarkupType.blockquote:
        return '>';
      case MarkupType.heading:
        return '#';
      case MarkupType.unorderedList:
        return '-';
      case MarkupType.orderedList:
        return '1.';
      case MarkupType.taskList:
        return '- [ ]';
      default:
        return;
    }
  }
}
