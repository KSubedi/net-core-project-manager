import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";

import Helpers from "../shared/helpers";

var projectObj: Object;
var jsonFilePath: string;

// Shows installed packages and gives option to remove them
export function removePackage() {
    // Find the path to project.json
    jsonFilePath = path.join(vscode.workspace.rootPath, "/project.json");

    // Check if the file exists first
    fs.exists(jsonFilePath, exists => {
        if (exists) {
            readFile();
        } else {
            Helpers.throwError("This project does not contain project.json file.");
        }
    });
}

function readFile() {
    fs.readFile(jsonFilePath, { encoding: "utf8" }, (err, data) => {
        if (err) {
            console.error(err);
            Helpers.throwError("Could not read project.json, please try again.");
        } else {
            // Store content of project.json file
            let projectJsonContent: string = data;
            try {
                // Parse the json
                projectObj = JSON.parse(projectJsonContent);

                showDependencies();
            } catch (error) {
                console.error(error);
                Helpers.throwError("Could not load dependencies, make sure the project.json file is valid.");
            }
        }
    })
}

// Shows all the dependencies
function showDependencies() {
    var dependenciesList = [];

    // Build array list of dependencies
    for (var name in projectObj["dependencies"]) {
        dependenciesList.push(name);
    }

    // Make sure dependencies are not empty
    if (dependenciesList.length < 1) {
        Helpers.throwError("You do not have any dependencies on this project.");
    } else {
        vscode.window.showQuickPick(dependenciesList)
            .then(item => {
                if(item){
                    // Delete the selected item
                    deleteItem(item);
                }
            });
    }
}

// Delete the dependency object
function deleteItem(item: string) {
    delete (projectObj["dependencies"][item]);
    writeFile(item);
}

// Create a new JSON string and write to file
function writeFile(deletedItem: string) {
    try {
        let outputFileString = JSON.stringify(projectObj, null, 2);

        fs.writeFile(jsonFilePath, outputFileString, err => {
            if (err) {
                console.error(err);
                Helpers.throwError("Could not write project.json file, make sure it is writeable.");
            } else {
                Helpers.showMessage("Deleted package " + deletedItem + ", make sure to run 'dotnet restore' now.");
            }
        })

    } catch (error) {
        console.error(error);
        Helpers.throwError("Could not parse the new project.json structure.");
    }
}

