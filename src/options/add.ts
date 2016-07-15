/// <reference path="../../node_modules/axios/axios.d.ts" />


import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";
import * as axios from "axios";

import Helpers from "../shared/helpers";

var jsonFilePath: string;

let API_URL_SEARCH = "https://api-v2v3search-0.nuget.org/autocomplete";
let API_URL_VERSIONS = "https://api.nuget.org/v3-flatcontainer/";

// Lets you add a new package
export function addPackage() {
    jsonFilePath = path.join(vscode.workspace.rootPath, "/project.json");

    showSearch();
}

// Shows search box and searches
function showSearch() {
    vscode.window.showInputBox({
        placeHolder: "Type the package name or search term."
    }).then(searchValue => {

        vscode.window.setStatusBarMessage("Loading packages...");
        
        axios.get(API_URL_SEARCH, {
            params: {
                q: searchValue,
                prerelease: true,
                take: 100
            }
        }).then(response => {
            var packageList = response.data.data;

            if (packageList.length < 1) {
                Helpers.throwError("No results found. Please try again.");
            } else {
                vscode.window.showQuickPick(packageList)
                    .then(packageName => {
                        if (packageName) {
                            showVersionChooser(packageName);
                        }
                    });
            }
            vscode.window.setStatusBarMessage("");            
        }).catch(error => {
            vscode.window.setStatusBarMessage("");
            
            console.error(error);
            Helpers.throwError("Could not connect to Nuget server.");
        });
    });
}

// Lets you choose a version
function showVersionChooser(packageName: string) {
    vscode.window.setStatusBarMessage("Loading package versions...");

    axios.get(API_URL_VERSIONS + packageName + "/index.json")
    .then(response => {
        try {
            var versionList = response.data.versions;

            versionList.reverse();

            versionList.push("Latest Version (Wildcard *)");

            vscode.window.showQuickPick(versionList, {
                placeHolder: "Choose version to add."
            }).then(packageVersion => {
                if (packageVersion) {
                    if (packageVersion === "Latest Version (Wildcard *)") {
                        packageVersion = "*";
                    }

                    writeFile(packageName, packageVersion);
                }
            });

        } catch (error) {
            console.error(error);
            Helpers.throwError("Could not parse response from Nuget server.");
        }
        vscode.window.setStatusBarMessage("");        
    }).catch(error => {
        vscode.window.setStatusBarMessage("");        
        console.error(error);
        Helpers.throwError("Could not connect to Nuget server.");
    });;

}

// Writes the data to file
function writeFile(packageName: string, packageVersion: string) {
    fs.readFile(jsonFilePath, { encoding: "utf8" }, (err, jsonFileData) => {
        if (err) {
            console.error(err);
            Helpers.throwError("Could not read project.json, please try again.");
        } else {
            try {
                var jsonObj = JSON.parse(jsonFileData);

                if (!jsonObj["dependencies"]) {
                    jsonObj["dependencies"] = {};
                }
                jsonObj.dependencies[packageName] = packageVersion;
                var jsonString = JSON.stringify(jsonObj, null, 2);
                fs.writeFile(jsonFilePath, jsonString, err => {
                    if (err) {
                        console.error(err);
                        Helpers.throwError("Could not write project.json, please try again.")
                    } else {
                        Helpers.showMessage("Added " + packageName + ":" + packageVersion + " to package.json. Make sure to run 'dotnet restore'.")
                    }
                });
            } catch (error) {
                console.error(error);
                Helpers.throwError("Could not parse project.json. Make sure it is valid.");
            }
        }
    });
}