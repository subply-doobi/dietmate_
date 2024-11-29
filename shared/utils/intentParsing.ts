// export class IntentUrlParser {
//   appLink: string;
//   params: {[key: string]: string};
//   originalIntentUrl: string;
//   convertedIntentUrl: string;

//   constructor(intentUrl: string) {
//     this.originalIntentUrl = intentUrl;

//     const intentIndex = intentUrl.indexOf('#Intent');
//     if (intentIndex === -1) {
//       throw new Error('Invalid intent URL format');
//     }

//     const baseUrl = intentUrl.substring(0, intentIndex);
//     const params = intentUrl.substring(intentIndex + 8).split(';');

//     let appScheme = '';
//     const otherParams: {[key: string]: string} = {};

//     for (const param of params) {
//       if (param.includes('=')) {
//         const [key, value] = param.split('=');
//         otherParams[key] = value;
//         if (key === 'scheme') {
//           appScheme = value;
//         }
//       }
//     }

//     // Infer scheme if not explicitly provided
//     if (!appScheme) {
//       const schemeStart = baseUrl.indexOf(':') + 1;
//       const schemeEnd = baseUrl.indexOf('://');
//       if (schemeStart !== -1 && schemeEnd !== -1) {
//         appScheme = baseUrl.substring(schemeStart, schemeEnd);
//       } else {
//         throw new Error('Invalid intent URL format: scheme not found');
//       }
//     }

//     // Handle different formats of intent URLs
//     let appLinkBase = baseUrl;
//     if (baseUrl.startsWith('intent://')) {
//       appLinkBase = baseUrl.replace('intent://', '');
//     } else if (baseUrl.startsWith('intent:')) {
//       appLinkBase = baseUrl.replace(`intent:${appScheme}://`, '');
//     }

//     this.appLink = appScheme + '://' + appLinkBase;
//     this.params = otherParams;

//     // Construct the converted intent URL
//     if (baseUrl.startsWith('intent:')) {
//       this.convertedIntentUrl = `intent://${appLinkBase}#Intent;${params.join(';')}`;
//     } else {
//       this.convertedIntentUrl = this.originalIntentUrl;
//     }
//   }
// }

// v2
export class IntentUrlParser {
  appLink: string;
  params: {[key: string]: string};
  originalIntentUrl: string;
  convertedIntentUrl: string;

  constructor(intentUrl: string) {
    this.originalIntentUrl = intentUrl;

    if (!intentUrl.startsWith('intent:')) {
      // Handle URLs that are already in appLink format
      this.appLink = intentUrl;
      this.params = this.extractParamsFromUrl(intentUrl);
      this.convertedIntentUrl = intentUrl;
      return;
    }

    const intentIndex = intentUrl.indexOf('#Intent');
    if (intentIndex === -1) {
      throw new Error('Invalid intent URL format');
    }

    const baseUrl = intentUrl.substring(0, intentIndex);
    const params = intentUrl.substring(intentIndex + 8).split(';');

    let appScheme = '';
    const otherParams: {[key: string]: string} = {};

    for (const param of params) {
      if (param.includes('=')) {
        const [key, value] = param.split('=');
        otherParams[key] = value;
        if (key === 'scheme') {
          appScheme = value;
        }
      }
    }

    // Infer scheme if not explicitly provided
    if (!appScheme) {
      const schemeStart = baseUrl.indexOf(':') + 1;
      const schemeEnd = baseUrl.indexOf('://');
      if (schemeStart !== -1 && schemeEnd !== -1) {
        appScheme = baseUrl.substring(schemeStart, schemeEnd);
      } else {
        throw new Error('Invalid intent URL format: scheme not found');
      }
    }

    // Handle different formats of intent URLs
    let appLinkBase = baseUrl;
    if (baseUrl.startsWith('intent://')) {
      appLinkBase = baseUrl.replace('intent://', '');
    } else if (baseUrl.startsWith('intent:')) {
      appLinkBase = baseUrl.replace(`intent:${appScheme}://`, '');
    }

    this.appLink = appScheme + '://' + appLinkBase;
    this.params = otherParams;

    // Construct the converted URL
    if (baseUrl.startsWith('intent:')) {
      this.convertedIntentUrl = `intent://${appLinkBase}#Intent;${params.join(';')}`;
    } else {
      this.convertedIntentUrl = this.originalIntentUrl;
    }
  }

  private extractParamsFromUrl(url: string): {[key: string]: string} {
    const params: {[key: string]: string} = {};
    const queryStart = url.indexOf('?');
    if (queryStart !== -1) {
      const queryString = url.substring(queryStart + 1);
      const queryParts = queryString.split('&');
      for (const part of queryParts) {
        const [key, value] = part.split('=');
        if (key && value) {
          params[key] = value;
        }
      }
    } else {
      // Handle parameters directly in the path
      const pathParts = url.split('://')[1].split('/');
      for (const part of pathParts) {
        if (part.includes('=')) {
          const [key, value] = part.split('=');
          if (key && value) {
            params[key] = value;
          }
        }
      }
    }
    return params;
  }
}
