import * as msal from '@azure/msal-browser';
// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 * For more details on using MSAL.js with Azure AD B2C, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/working-with-b2c.md 
 */
// The current application coordinates were pre-registered in a B2C tenant.
const apiConfig = {
    b2cScopes: ["https://fabrikamb2c.onmicrosoft.com/helloapi/demo.read"],
    webApi: "https://fabrikamb2chello.azurewebsites.net/hello"
  };

 const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_susi_reset_v2",
        editProfile: "B2C_1_edit_profile_v2"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_susi_reset_v2",
        },
        editProfile: {
            authority: "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_edit_profile_v2"
        }
    },
    authorityDomain: "fabrikamb2c.b2clogin.com"
}

 const msalConfig = {
    auth: {
      clientId: "2d84a2ac-c784-4d21-872b-6b95418ee075", // This is the ONLY mandatory field; everything else is optional.
      authority: "https://oncobank00.b2clogin.com/oncobank00.onmicrosoft.com/B2C_1_signupsignin1", // Choose sign-up/sign-in user-flow as your default.
      knownAuthorities: ["oncobank00.b2clogin.com"], // You must identify your tenant's domain as a known authority.
      redirectUri: "https://localhost:5001", // You must register this URI on Azure Portal/App Registration. Defaults to "window.location.href".
    },
    cache: {
      cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
      storeAuthStateInCookie: false, // If you wish to store cache items in cookies as well as browser cache, set this to "true".
    }
  };
  
  /**
  * Scopes you add here will be prompted for user consent during sign-in.
  * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
  * For more information about OIDC scopes, visit: 
  * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
  */
  const loginRequest = {
  scopes: ["openid", "https://oncobank00.onmicrosoft.com/helloapi/demo.read"],
  };
  
  /**
  * Scopes you add here will be used to request a token from Azure AD B2C to be used for accessing a protected resource.
  * To learn more about how to work with scopes and resources, see: 
  * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
  */
  const tokenRequest = {
  scopes: ["https://oncobank00.onmicrosoft.com/helloapi/demo.read"],  // e.g. ["https://oncobank00.onmicrosoft.com/helloapi/demo.read"]
  forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
  };

const myMSALObj = new msal.PublicClientApplication(msalConfig);

let accountId = "";
let username = "";
let token;

function setAccount(account) {
    accountId = account.homeAccountId;
    username = account.username;
    //welcomeUser(username);
}

export function selectAccount() {
    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();

    if (currentAccounts.length < 1) {
        return;
    } else if (currentAccounts.length > 1) {

        /**
         * Due to the way MSAL caches account objects, the auth response from initiating a user-flow
         * is cached as a new account, which results in more than one account in the cache. Here we make
         * sure we are selecting the account with homeAccountId that contains the sign-up/sign-in user-flow, 
         * as this is the default flow the user initially signed-in with.
         */
        const accounts = currentAccounts.filter(account =>
            account.homeAccountId.toUpperCase().includes(b2cPolicies.names.signUpSignIn.toUpperCase())
            &&
            account.idTokenClaims.iss.toUpperCase().includes(b2cPolicies.authorityDomain.toUpperCase())
            &&
            account.idTokenClaims.aud === msalConfig.auth.clientId 
            );

        if (accounts.length > 1) {
            // localAccountId identifies the entity for which the token asserts information.
            if (accounts.every(account => account.localAccountId === accounts[0].localAccountId)) {
                // All accounts belong to the same user
                setAccount(accounts[0]);
            } else {
                // Multiple users detected. Logout all to be safe.
                signOut();
            };
        } else if (accounts.length === 1) {
            setAccount(accounts[0]);
        }

    } else if (currentAccounts.length === 1) {
        setAccount(currentAccounts[0]);
    }
}

// in case of page refresh
selectAccount();

function handleResponse(response) {
    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */

    if (response !== null) {
        setAccount(response.account);
    } else {
        selectAccount();
    }
}

export async function signIn() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    await myMSALObj.loginPopup(loginRequest)
        .then(handleResponse)
        .catch(error => {
            console.log(error);
        });

    await passTokenToApi();
    return token;
}

function signOut() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    const logoutRequest = {
        postLogoutRedirectUri: msalConfig.auth.redirectUri,
        mainWindowRedirectUri: msalConfig.auth.redirectUri
    };

    myMSALObj.logoutPopup(logoutRequest);
}

function getTokenPopup(request) {

    /**
    * See here for more information on account retrieval: 
    * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
    */
    request.account = myMSALObj.getAccountByHomeId(accountId);


    /**
     * 
     */
    return myMSALObj.acquireTokenSilent(request)
        .then((response) => {
            // In case the response from B2C server has an empty accessToken field
            // throw an error to initiate token acquisition
            if (!response.accessToken || response.accessToken === "") {
                throw new msal.InteractionRequiredAuthError;
            }
            return response;
        })
        .catch(error => {
            console.log("Silent token acquisition fails. Acquiring token using popup. \n", error);
            if (error instanceof msal.InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return myMSALObj.acquireTokenPopup(request)
                    .then(response => {
                        console.log(response);
                    }).catch(error => {
                        console.log(error);
                    });
            } else {
                console.log(error);
            }
        });
}



export async function passTokenToApi() {
    await getTokenPopup(tokenRequest)
        .then(response => {
            if (response) {
                console.log("access_token acquired at: " + new Date().toString());
                try {
                    console.log(response.accessToken);
                    token = response.accessToken;
                    //callApi('api/todo', response.accessToken);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    return token;
}

/**
 * To initiate a B2C user-flow, simply make a login request using
 * the full authority string of that user-flow e.g.
 * https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_edit_profile_v2 
 */
function editProfile() {
    
    const editProfileRequest = b2cPolicies.authorities.editProfile;
    editProfileRequest.loginHint = myMSALObj.getAccountByHomeId(accountId).username;

    myMSALObj.loginPopup(editProfileRequest)
        .catch(error => {
            console.log(error);
        });
}

export async function callApi(method, endpoint, body) {
    
    await passTokenToApi();

    const headers = new Headers();
    const bearer = `Bearer ${token}`;
  
    headers.append("Authorization", bearer);
    var options;

    if(body === null) {
        options = {
            method: method,
            headers: headers
        };
    } else {
        options = {
            method: method,
            headers: headers,
            body: JSON.stringify(body)
        };
    }
    console.log(options);
    var response = await fetch(endpoint, options);
    return response;
}

export async function addItem(item) {

    await passTokenToApi();

    const headers = new Headers();
    const bearer = `Bearer ${token}`;
  
    headers.append("Authorization", bearer);
    headers.append("Content-Type", 'application/json');

    const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(item)
    };

    await fetch('api/todo', options);
}