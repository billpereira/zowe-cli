/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

import { Create, CreateDataSetTypeEnum, Delete, IUploadOptions, IZosFilesResponse, Upload, ZosFilesMessages } from "../../../../../";
import { Imperative, Session } from "@brightside/imperative";
import { inspect } from "util";
import { ITestEnvironment } from "../../../../../../../__tests__/__src__/environment/doc/response/ITestEnvironment";
import { TestEnvironment } from "../../../../../../../__tests__/__src__/environment/TestEnvironment";
import { TestProperties } from "../../../../../../../__tests__/__src__/properties/TestProperties";
import { ITestSystemSchema } from "../../../../../../../__tests__/__src__/properties/ITestSystemSchema";
import { getUniqueDatasetName, stripNewLines } from "../../../../../../../__tests__/__src__/TestUtils";

let REAL_SESSION: Session;
let testEnvironment: ITestEnvironment;
let systemProps: TestProperties;
let defaultSystem: ITestSystemSchema;
let dsname: string;

const uploadOptions: IUploadOptions = {} as any;

describe("Upload Data Set", () => {

    beforeAll(async () => {
        testEnvironment = await TestEnvironment.setUp({
            tempProfileTypes: ["zosmf"],
            testName: "zos_file_upload"
        });
        systemProps = new TestProperties(testEnvironment.systemTestProperties);
        defaultSystem = systemProps.getDefaultSystem();

        REAL_SESSION = new Session({
            user: defaultSystem.zosmf.user,
            password: defaultSystem.zosmf.pass,
            hostname: defaultSystem.zosmf.host,
            port: defaultSystem.zosmf.port,
            type: "basic",
            rejectUnauthorized: defaultSystem.zosmf.rejectUnauthorized,
        });

        dsname = getUniqueDatasetName(`${defaultSystem.zosmf.user}.ZOSFILE.UPLOAD`);
        Imperative.console.info("Using dsname:" + dsname);
    });

    afterAll(async () => {
        await TestEnvironment.cleanUp(testEnvironment);
    });

    describe("Success Scenarios", () => {

        describe("Physical sequential", () => {

            beforeEach(async () => {
                let error;
                let response;

                try {
                    response = await Create.dataSet(REAL_SESSION,
                        CreateDataSetTypeEnum.DATA_SET_SEQUENTIAL, dsname);
                } catch (err) {
                    error = err;
                }
            });

            afterEach(async () => {
                let error;
                let response;

                try {
                    response = await Delete.dataSet(REAL_SESSION, dsname);
                } catch (err) {
                    error = err;
                }
            });

            it("should upload a file to a physical sequential data set using full path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        __dirname + "/testfiles/upload.txt", dsname);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload a file to a physical sequential data set using relative path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        "./packages/zosfiles/__tests__/__system__/api/methods/upload/testfiles/upload.txt", dsname);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload a file to a physical sequential data set using Windows relative path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        ".\\packages\\zosfiles\\__tests__\\__system__\\api\\methods\\upload\\testfiles\\upload.txt", dsname);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload a file to a physical sequential data set in binary mode", async () => {
                let error;
                let response: IZosFilesResponse;

                uploadOptions.binary = true;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        __dirname + "/testfiles/upload.txt", dsname, uploadOptions);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should display proper error when specifying dir instead of a file", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    response = await Upload.fileToDataset(REAL_SESSION,
                        __dirname + "/testfiles", dsname);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(response).toBeFalsy();
                expect(error).toBeTruthy();
                expect(stripNewLines(error.message)).toContain(ZosFilesMessages.missingInputFile.message);
            });
        });

        describe("Partitioned data set", () => {

            beforeEach(async () => {
                let error;
                let response;

                try {
                    response = await Create.dataSet(REAL_SESSION, CreateDataSetTypeEnum.DATA_SET_PARTITIONED, dsname);
                } catch (err) {
                    error = err;
                }
            });

            afterEach(async () => {
                let error;
                let response;

                try {
                    response = await Delete.dataSet(REAL_SESSION, dsname);
                } catch (err) {
                    error = err;
                }
            });

            it("should upload a file to a partitioned data set member using full path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        __dirname + "/testfiles/upload.txt", dsname + "(member)");
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload a file to a partitioned data set member using relative path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        "./packages/zosfiles/__tests__/__system__/api/methods/upload/testfiles/upload.txt", dsname + "(member)");
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload a file to a partitioned data set member using Windows relative path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        ".\\packages\\zosfiles\\__tests__\\__system__\\api\\methods\\upload\\testfiles\\upload.txt", dsname + "(member)");
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload a file to a partitioned data set member in binary mode", async () => {
                let error;
                let response: IZosFilesResponse;

                uploadOptions.binary = true;

                try {
                    // packages/zosfiles/__tests__/__system__/api/methods/upload/
                    response = await Upload.fileToDataset(REAL_SESSION,
                        __dirname + "/testfiles/upload.txt", dsname + "(member)", uploadOptions);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });

            it("should upload files in a directory to a partitioned data set member using full path", async () => {
                let error;
                let response: IZosFilesResponse;

                try {

                    response = await Upload.dirToPds(REAL_SESSION, __dirname + "/testfiles", dsname);
                    Imperative.console.info("Response: " + inspect(response));
                } catch (err) {
                    error = err;
                    Imperative.console.info("Error: " + inspect(error));
                }
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(response.success).toBeTruthy();
                expect(response.commandResponse).toContain(ZosFilesMessages.dataSetUploadedSuccessfully.message);
            });
        });
    });

    describe("Failure Scenarios", () => {

        beforeEach(async () => {
            let error;
            let response;

            try {
                response = await Create.dataSet(REAL_SESSION, CreateDataSetTypeEnum.DATA_SET_PARTITIONED, dsname);
            } catch (err) {
                error = err;
            }
        });

        afterEach(async () => {
            let error;
            let response;

            try {
                response = await Delete.dataSet(REAL_SESSION, dsname);
            } catch (err) {
                error = err;
            }
        });

        it("should display proper error when not specifying file", async () => {
            let error;
            let response: IZosFilesResponse;

            try {
                response = await Upload.fileToDataset(REAL_SESSION,
                    __dirname + "/testfiles", dsname);
                Imperative.console.info("Response: " + inspect(response));
            } catch (err) {
                error = err;
                Imperative.console.info("Error: " + inspect(error));
            }
            expect(response).toBeFalsy();
            expect(error).toBeTruthy();
            expect(stripNewLines(error.message)).toContain(ZosFilesMessages.missingInputFile.message);
        });

        it("should display proper error when not specifying data set", async () => {
            let error;
            let response: IZosFilesResponse;

            try {
                response = await Upload.fileToDataset(REAL_SESSION,
                    __dirname + "/testfiles/upload.text", "");
                Imperative.console.info("Response: " + inspect(response));
            } catch (err) {
                error = err;
                Imperative.console.info("Error: " + inspect(error));
            }
            expect(response).toBeFalsy();
            expect(error).toBeTruthy();
            expect(stripNewLines(error.message)).toContain(ZosFilesMessages.missingDatasetName.message);
        });

        it("should display proper error when specifying file instead of directory", async () => {
            let error;
            let response: IZosFilesResponse;

            try {
                response = await Upload.dirToPds(REAL_SESSION,
                    __dirname + "/testfiles/upload.txt", dsname);
                Imperative.console.info("Response: " + inspect(response));
            } catch (err) {
                error = err;
                Imperative.console.info("Error: " + inspect(error));
            }
            expect(response).toBeFalsy();
            expect(error).toBeTruthy();
            expect(stripNewLines(error.message)).toContain("is not a directory"); // pathIsNotDirectory error
        });

        it("should display proper error when specifying dir instead of a file", async () => {
            let error;
            let response: IZosFilesResponse;

            try {
                response = await Upload.fileToDataset(REAL_SESSION,
                    __dirname + "/testfiles", dsname);
                Imperative.console.info("Response: " + inspect(response));
            } catch (err) {
                error = err;
                Imperative.console.info("Error: " + inspect(error));
            }
            expect(response).toBeFalsy();
            expect(error).toBeTruthy();
            expect(stripNewLines(error.message)).toContain(ZosFilesMessages.missingInputFile.message);
        });

        it("should display proper error when uploading the contents of a dir to a partitioned data set member", async () => {
            let error;
            let response: IZosFilesResponse;

            try {
                // packages/zosfiles/__tests__/__system__/api/methods/upload/
                response = await Upload.dirToPds(REAL_SESSION,
                    __dirname + "/testfiles", dsname + "(member)");
                Imperative.console.info("Response: " + inspect(response));
            } catch (err) {
                error = err;
                Imperative.console.info("Error: " + inspect(error));
            }
            expect(response).toBeFalsy();
            expect(error).toBeTruthy();
            expect(stripNewLines(error.message)).toContain(ZosFilesMessages.uploadDirectoryToDatasetMember.message);
        });

        it("should display proper error is line in file exceeds record length of data set", async () => {
            let error;
            let response: IZosFilesResponse;

            try {
                response = await Upload.fileToDataset(REAL_SESSION,
                    __dirname + "/testfiles//longline/longline.txt", dsname);
                Imperative.console.info("Response: " + inspect(response));
            } catch (err) {
                error = err;
                Imperative.console.info("Error: " + inspect(error));
            }
            expect(response).toBeTruthy();
            expect(response.success).toBeFalsy();
            expect(stripNewLines(response.commandResponse)).toContain("Truncation of a record occurred during an I/O operation");
        });
    });
});

