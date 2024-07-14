import * as fs from "fs";
import * as vs from "vscode";
import * as lc from "vscode-languageclient/node";

export function activate(_: vs.ExtensionContext) {
  start_language_server();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

let client: lc.LanguageClient;

function start_language_server() {
  const config = vs.workspace.getConfiguration("rock-ls");
  let config_path = config.get("path");
  let rock_ls_path: string = "rock_ls";

  if (typeof config_path === "string") {
    let common = `Please ensure it points to 'rock_ls' executable.
    You can edit "rock-ls.path" in the settings.`;

    if (!fs.existsSync(config_path)) {
      error_message(`Specified "rock-ls.path" does not exist.`, common);
      return;
    } else if (!fs.statSync(config_path).isFile()) {
      error_message(`Specified "rock-ls.path" is not a file.`, common);
      return;
    } else if (!(config_path.endsWith("rock_ls") || config_path.endsWith("rock_ls.exe"))) {
      error_message(`Specified "rock-ls.path" points to unknown file.`, common);
      return;
    } else {
      rock_ls_path = config_path;
    }
  }

  const serverOptions: lc.ServerOptions = {
    run: { command: rock_ls_path, transport: lc.TransportKind.stdio },
    debug: { command: rock_ls_path, transport: lc.TransportKind.stdio },
  };

  const clientOptions: lc.LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "rock" }],
    synchronize: {
      fileEvents: vs.workspace.createFileSystemWatcher("**/*.rock"),
    },
  };

  client = new lc.LanguageClient(
    "rock-ls",
    "rock-ls",
    serverOptions,
    clientOptions
  );

  client.start().catch(() => {
    const message = `Could not resolve path to 'rock_ls' executable.
    Please ensure it is available in PATH used by VSCode.
    Or explicitly set "rock-ls.path" in the settings.`;
    error_message(message);
  });
}

function error_message(message: string, common?: string) {
  const full_message = common ? `${message} ${common}` : message;
  vs.window.showErrorMessage(full_message);
}

vs.commands.registerCommand("rock-ls.restart", () => {
  client?.restart();
});

vs.commands.registerCommand("rock-ls.disable", () => {
  client?.stop();
});
