
export function setCookie(name, value, days = 7, options = {}) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;

  if (options.secure !== false && window.location.protocol === 'https:') {
    cookieString += ';secure';
  }

  const sameSite = options.sameSite || 'strict';
  cookieString += `;sameSite=${sameSite}`;

  document.cookie = cookieString;
}

export function getCookie(name) {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  
  return null;
}


export function removeCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function hasCookie(name) {
  return getCookie(name) !== null;
}


export const cookieStorage = {
  getItem(key) {
    return getCookie(key);
  },
  setItem(key, value, days = 7) {
    setCookie(key, value, days);
  },
  removeItem(key) {
    removeCookie(key);
  },
  clear() {

    console.warn('cookieStorage.clear() - Please remove specific cookies');
  },
};

