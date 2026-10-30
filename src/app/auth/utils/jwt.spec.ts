import { base64UrlEncode } from './oauth-crypto';
import { decodeJwtPayload, scopesOf } from './jwt';

const fakeJwt = (payload: object) =>
  `e30.${base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)))}.sig`;

describe('jwt', () => {

  it('reads role scopes from the array scope claim', () => {
    expect(scopesOf(fakeJwt({ scope: ['openid', 'finco:premium'] }))).toEqual(['openid', 'finco:premium']);
    expect(scopesOf(fakeJwt({}))).toEqual([]);
    expect(scopesOf('not-a-jwt')).toEqual([]);
  });

  it('decodes base64url JWT payloads with non-ASCII characters', () => {
    expect(decodeJwtPayload(fakeJwt({ name: 'Leonardo Hernández' }))?.['name']).toBe('Leonardo Hernández');
  });

});
