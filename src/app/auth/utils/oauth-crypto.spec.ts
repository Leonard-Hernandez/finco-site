import { codeChallengeS256, randomString } from './oauth-crypto';

describe('oauth-crypto', () => {

  it('computes the RFC 7636 appendix B S256 challenge', async () => {
    expect(await codeChallengeS256('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'))
      .toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('generates verifiers from the unreserved alphabet', () => {
    const verifier = randomString(64);
    expect(verifier.length).toBe(64);
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    expect(randomString(64)).not.toBe(verifier);
  });

});
