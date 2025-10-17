export const adsAvailable = false;

export const showRewardedAdAsync = async (): Promise<boolean> => {
  if (__DEV__) {
    console.info('[ads] Rewarded ad stub invoked; returning success.');
  }
  return true;
};

export const initializeAds = async (): Promise<void> => {
  // noop
};
