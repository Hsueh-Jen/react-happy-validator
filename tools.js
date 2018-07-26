export function isPhone(str) {
  const pattern = /^[+]?[0-9]+$/;
  return pattern && pattern.test(str);
}

export function isEmail(str) {
  const pattern = /^(?=[^\s]+)(?=(\w+)@([\w.]+[\w]$))/;
  return pattern && pattern.test(str);
}

// regular expression was reference by https://www.regextester.com/94502
export function isURL(str) {
  const pattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/i;
  return pattern && pattern.test(str);
}

export function isUUID(str) {
  const pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
  return pattern && pattern.test(str);
}
