import * as vs from "vscode";
import * as lc from "vscode-languageclient/node";

let client: lc.LanguageClient;

export function activate(_: vs.ExtensionContext) {
  const serverPath = "lang-ls";
  const serverOptions: lc.ServerOptions = {
    run: { command: serverPath, transport: lc.TransportKind.stdio },
    debug: { command: serverPath, transport: lc.TransportKind.stdio },
  };

  const clientOptions: lc.LanguageClientOptions = {
    diagnosticCollectionName: "lang_diagnostic_collection",
    documentSelector: [{ scheme: "file", language: "lang" }],
    synchronize: {
      fileEvents: vs.workspace.createFileSystemWatcher("**/*.lang"),
    },
  };

  client = new lc.LanguageClient(
    "lang-ls",
    "lang-ls",
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
