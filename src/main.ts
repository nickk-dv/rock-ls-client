import * as vs from "vscode";
import * as lc from "vscode-languageclient/node";

let client: lc.LanguageClient;

export function activate(_: vs.ExtensionContext) {
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

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
