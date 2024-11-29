export const checkIsUpdateNeeded = ({
  appVersion,
  latestVersion,
}: {
  appVersion: string;
  latestVersion: string;
}) => {
  const versionArray = (version: string) => version.split('.').map(Number);

  const clientVersionArray = versionArray(appVersion);
  const latestVersionArray = versionArray(latestVersion);
  const messages = [
    'Major Version Outdated',
    'Minor Version Outdated',
    'Patch Version Outdated',
  ];

  // cases :
  // 1. major version outdated => update needed
  // 2. major version same, minor version outdated => update not needed
  // 3. major version same, minor version same, patch version outdated => update needed
  for (let i = 0; i < clientVersionArray.length; i++) {
    if (clientVersionArray[i] < latestVersionArray[i]) {
      return {isUpdateNeeded: i !== 1, message: messages[i]};
    }
  }

  return {isUpdateNeeded: false, message: ''};
};
