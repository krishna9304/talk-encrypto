export function extractCookies(cookieStr: any) {
  return cookieStr
    .match(/(^|(?<=, ))[^=;,]+=[^;]+/g)
    .map((cookie: string) => cookie.split("=").map((v) => v.trim()))
    .filter((v: Array<any>) => v[0].length && v[1].length)
    .reduce((builder: any, cur: Array<any>) => {
      builder[cur[0]] = cur[1];
      return builder;
    }, {});
}
