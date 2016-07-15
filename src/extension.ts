'use strict';
import * as vscode from 'vscode';

import {removePackage} from "./options/remove";
import {addPackage} from "./options/add";

export function activate(context: vscode.ExtensionContext) {
    let commands = [
        vscode.commands.registerCommand('extension.removePackage', removePackage),
        vscode.commands.registerCommand('extension.addPackage', addPackage)
    ]

    commands.forEach(command => {
        context.subscriptions.push(command);
    })
}

export function deactivate() {
}