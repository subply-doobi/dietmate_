export const checkIsUpdateNeeded = ({
  appVersion,
  latestVersion,
}: {
  appVersion: string;
  latestVersion: string;
}) => {
  const versionArray = (version: string) => version.split(".").map(Number);

  const clientVersionArray = versionArray(appVersion);
  const latestVersionArray = versionArray(latestVersion);
  const messages = [
    "Major Version Outdated",
    "Minor Version Outdated",
    "Patch Version Outdated",
  ];

  // update needed except for patch version oudated
  for (let i = 0; i < clientVersionArray.length; i++) {
    if (clientVersionArray[i] < latestVersionArray[i]) {
      return { isUpdateNeeded: i !== 2, message: messages[i] };
    }
  }

  return { isUpdateNeeded: false, message: "" };
};
