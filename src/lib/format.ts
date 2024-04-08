const CODE_GREEN = '\x1b[32m';
const CODE_RESET = '\x1b[0m';

export function success(strings: TemplateStringsArray, ...values: any[]) {
  const message = strings.reduce((result, str, i) => {
    const value = values[i] || '';
    return `${result}${str}${value}`;
  }, '');
  return `${CODE_GREEN}SUCCESS${CODE_RESET} ${message}`;
}

const CODE_RED = '\x1b[31m';
export function err(strings: TemplateStringsArray, ...values: any[]) {
  const message = strings.reduce((result, str, i) => {
    const value = values[i] || '';
    return `${result}${str}${value}`;
  }, '');
  return `${CODE_RED}ERROR${CODE_RESET} ${message}`;
}
