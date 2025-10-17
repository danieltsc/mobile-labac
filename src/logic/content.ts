import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

import { getContentModule } from './contentRegistry';

const contentCache = new Map<string, string>();

export const loadMarkdownContent = async (relativePath: string): Promise<string> => {
  if (contentCache.has(relativePath)) {
    return contentCache.get(relativePath)!;
  }

  const moduleId = getContentModule(relativePath);
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const fileUri = asset.localUri ?? asset.uri;
  const content = await FileSystem.readAsStringAsync(fileUri);
  contentCache.set(relativePath, content);
  return content;
};
