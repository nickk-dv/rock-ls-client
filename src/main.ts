import * as vs from "vscode";
import * as lc from "vscode-languageclient/node";

let client: lc.LanguageClient;

export function activate(_: vs.ExtensionContext) {
  start_language_server();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

function start_language_server() {
  const serverPath = "rock_ls";
  const serverOptions: lc.ServerOptions = {
    run: { command: serverPath, transport: lc.TransportKind.stdio },
    debug: { command: serverPath, transport: lc.TransportKind.stdio },
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

  client.start();
}

vs.commands.registerCommand("rock.restart", () => {
  if (client) {
    client.restart();
  } else {
    start_language_server();
  }
});

vs.commands.registerCommand("rock.disable", () => {
  if (client) {
    client.stop().then(() => {});
  }
});
