import { StorageData } from "../types";

export interface IStorage {
  isStorageExist: () => boolean;
  clearStorageData: () => void;
  setStorageData: (data: StorageData) => void;
  getStorageData: () => StorageData;
}
