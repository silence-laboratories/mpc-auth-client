// Copyright (c) Silence Laboratories Pte. Ltd.
// This software is licensed under the Silence Laboratories License Agreement.

import { StorageData, PairingData } from "../types";
import { SdkError, ErrorCode } from "../error";
import fs from "fs";

/**
 * Function to check if a storage exist
 *
 * @returns true if exists, false otherwise
 */
const isStorageExist = async (): Promise<boolean> => {
  try {
    const fileExists = fs.existsSync("storage.json");
    return fileExists;
  } catch (error) {
    throw new SdkError("error", ErrorCode.StorageError);
  }
};

/**
 * Delete the stored data, if it exists.
 */
const deleteStorage = async () => {
  try {
    if (fs.existsSync("storage.json")) {
      fs.unlinkSync("storage.json");
    }
  } catch (error) {
    throw new SdkError("Error", ErrorCode.StorageError);
  }
};

/**
 * Save SilentShareStorage
 *
 * @param data obj to save
 */
const saveSilentShareStorage = async (data: StorageData) => {
  try {
    if (data == null) {
      throw new SdkError("Storage data cannot be null", ErrorCode.InvalidData);
    }

    fs.writeFileSync("storage.json", JSON.stringify(data));
  } catch (error) {
    throw new SdkError("error", ErrorCode.StorageError);
  }
};

const recoveredKey = "null";

/**
 * Retrieve SilentShareStorage
 *
 * @returns SilentShareStorage object
 */
const getSilentShareStorage = async (): Promise<StorageData> => {
  try {
    const fileContent = fs.readFileSync("storage.json", "utf8");
    const jsonObject: StorageData = JSON.parse(fileContent);

    return jsonObject;
  } catch (error) {
    throw new SdkError("error.message", ErrorCode.StorageError);
  }
};

export {
  isStorageExist,
  deleteStorage,
  saveSilentShareStorage,
  getSilentShareStorage,
};
