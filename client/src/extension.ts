import * as path from "path";
import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // relying on env path being set
  const serverPath = "lang-ls";
  const serverOptions: ServerOptions = {
    run: { command: serverPath, transport: TransportKind.stdio },
    debug: { command: serverPath, transport: TransportKind.stdio, options: { env: { RUST_LOG: "debug" } } },
  };

  // options to control the language client
  const clientOptions: LanguageClientOptions = {
    // register the server for `.lang` files
    documentSelector: [{ scheme: "file", language: "lang" }],
    synchronize: {
      // notify the server about file changes to `.lang` files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/*.lang"),
    },
  };

  // create the language client and start the client.
  client = new LanguageClient(
    "lang-ls-client",
    "lang-ls",
    serverOptions,
    clientOptions
  );

  // start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
